// Univer 网格底座：实例生命周期 / 表头与数据读写 / 数据验证 / 条件格式 / 选区与命令事件
// ============================================================================
// 本文件职责：
//   1. 创建与销毁 Univer 实例（OSS presets：core + sort + filter + find-replace +
//      data-validation + conditional-formatting，不含任何 @univerjs-pro/* 商业包）；
//   2. 把"列定义 + 记录数组"写进画布表格（表头行 + 数据行），以及把整表读回成记录数组；
//   3. 按列定义下发数据验证（下拉/数字区间）与条件格式（数值列数据条）；
//   4. 暴露选区信息（A1/尺寸/值矩阵）、命令执行信号（脏值重算触发）、明暗主题切换。
//
// 在整体架构中的角色：对应 vxe 版的 useGridCore + useGridColumns + useCellSelection 的底座部分。
//   Univer 的画布表格是数据唯一真相源，本层是"外部模型 ↔ 网格"的唯一读写通道；
//   上层 composables（rules / ops / io / find）一律通过这里读写，不直接碰 Facade API。
//
// 关键约定（踩坑记录）：
//   - Univer 实例绝不能被 Vue 响应式代理（会引发渲染异常与性能问题），只存普通变量；
//   - 类型走本目录 univer-types.ts 的最小声明面（原因见该文件头注释）；
//   - 表头占网格第 0 行，数据从第 1 行开始，行号换算统一走 schema 的 toSheetRow / toDataIndex；
//   - 数据验证按列区间下发（不是逐格），区间按"当前数据行数 + 余量"给，结构变化后必须重下发；
//   - 脏标记没有行对象可挂，改用"命令执行 → 去抖 → 与基线快照逐格比对"，见页面层 recomputeDirty。
// ============================================================================
import { ref, shallowRef } from 'vue';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import UniverSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN';
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import UniverFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN';
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace';
import UniverFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import UniverDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN';
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import UniverConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN';
import '@univerjs/preset-sheets-core/lib/index.css';
import {
  ENTRY_FONT_SIZE,
  ENTRY_ROW_HEIGHT,
  HEADER_ROW,
  SHEET_COLUMN_COUNT,
  SHEET_ROW_COUNT,
  fromCellValue,
  toCellValue,
  type ColDef,
  type EntryRecord,
} from './schema';
import type { UApi, UIRange, USheet } from './univer-types';

/** 选区快照：状态栏与批量操作的作用域来源 */
export interface SelectionInfo {
  a1: string;
  rows: number;
  cols: number;
  values: unknown[][];
}

/** 命令执行后的去抖间隔（ms）：一次粘贴会连发多条命令，去抖后再重算统计与校验 */
const COMMAND_DEBOUNCE_MS = 260;

/**
 * 创建并托管 Univer 实例。
 * 返回的读写方法全部是命令式的（内部读 Facade API），调用方不必关心实例细节。
 */
export const useEntrySheet = () => {
  // Univer 实例与 API：绝不能进 ref/reactive（会代理内部模型导致渲染异常）
  let univerInstance: { dispose: () => void } | null = null;
  let apiInstance: UApi | null = null;

  const ready = ref(false);
  const sheet = shallowRef<USheet | null>(null);
  const selection = ref<SelectionInfo | null>(null);
  /** 命令执行计数：每有数据/结构变更自增一次，供上层用 watch 触发重算 */
  const revision = ref(0);

  let commandTimer: number | null = null;
  const bumpRevision = () => {
    if (commandTimer) window.clearTimeout(commandTimer);
    commandTimer = window.setTimeout(() => {
      commandTimer = null;
      revision.value++;
    }, COMMAND_DEBOUNCE_MS);
  };

  /** 默认工作簿快照：单 sheet，行/列数一次给足（避免边录边扩行触发整表重排） */
  const buildWorkbookData = () => ({
    id: 'univer-bi-entry',
    name: 'BI 数据录入',
    sheetOrder: ['sheet-bi-entry'],
    sheets: {
      'sheet-bi-entry': {
        id: 'sheet-bi-entry',
        name: '录入数据',
        rowCount: SHEET_ROW_COUNT,
        columnCount: SHEET_COLUMN_COUNT,
        // 行高与字号对齐另两套录入台（vxe 行高 36 / 字号 12.5，VTable 行高 36 / 字号 12）。
        // Univer 默认 20px 行高 + 11pt 字号，三页并排时密度差最明显。
        defaultRowHeight: ENTRY_ROW_HEIGHT,
        defaultStyle: { fs: ENTRY_FONT_SIZE },
        cellData: {},
      },
    },
  });

  /** 初始化：挂载容器，实例化 Univer 并创建空工作簿 */
  const init = (container: HTMLElement) => {
    if (univerInstance) return;
    const { univer, univerAPI } = createUniver({
      locale: LocaleType.ZH_CN,
      locales: {
        [LocaleType.ZH_CN]: mergeLocales(
          UniverCoreZhCN,
          UniverSortZhCN,
          UniverFilterZhCN,
          UniverFindReplaceZhCN,
          UniverDataValidationZhCN,
          UniverConditionalFormattingZhCN,
        ),
      },
      presets: [
        // 关掉 Univer 自带的 ribbon 工具条 / 公式栏 / 底部统计栏：页面用自有工具栏，
        // 避免与录入台的按钮组重复，也把纵向空间留给数据区
        UniverSheetsCorePreset({ container, header: false, toolbar: false, footer: false, formulaBar: false }),
        UniverSheetsSortPreset(),
        UniverSheetsFilterPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsDataValidationPreset(),
        UniverSheetsConditionalFormattingPreset(),
      ],
    });
    univerInstance = univer as unknown as { dispose: () => void };
    const api = univerAPI as unknown as UApi;
    apiInstance = api;
    const workbook = api.createWorkbook(buildWorkbookData());
    sheet.value = workbook.getActiveSheet();

    // 选区变化：刷新状态栏（A1 地址 / 尺寸 / 值矩阵）
    workbook.onSelectionChange((ranges) => {
      const first = ranges[0];
      const ws = sheet.value;
      if (!first || !ws) {
        selection.value = null;
        return;
      }
      const range = ws.getRange(first as UIRange);
      const values = range.getValues();
      selection.value = {
        a1: range.getA1Notation(),
        rows: values.length,
        cols: values[0]?.length ?? 0,
        values,
      };
    });

    // 任何命令执行后都可能是数据变更：去抖后推进 revision
    workbook.onCommandExecuted(() => bumpRevision());
    ready.value = true;
  };

  /** 销毁：解绑实例，避免页面切走后残留渲染循环 */
  const destroy = () => {
    if (commandTimer) {
      window.clearTimeout(commandTimer);
      commandTimer = null;
    }
    univerInstance?.dispose();
    univerInstance = null;
    apiInstance = null;
    sheet.value = null;
    selection.value = null;
    ready.value = false;
  };

  /** 明暗主题：跟随站点 html.dark（Univer 的 UI 层是 React，靠自身主题系统切换） */
  const setDark = (dark: boolean) => {
    apiInstance?.toggleDarkMode(dark);
  };

  /** Facade API 出口：查找替换等少数能力需要直接调 univerAPI（没有对应的 sheet 方法） */
  const getApi = (): UApi | null => apiInstance;

  /** 当前已有数据的最大行号（0-based，含表头）；无数据返回 -1 */
  const lastRow = (): number => sheet.value?.getLastRow() ?? -1;

  /** 当前数据行数（不含表头） */
  const dataRowCount = (): number => Math.max(0, lastRow() - HEADER_ROW);

  /** 读整表：表头行跳过，按列定义把值矩阵还原成记录数组 */
  const readRecords = (defs: ColDef[]): EntryRecord[] => {
    const ws = sheet.value;
    if (!ws || !defs.length) return [];
    const last = lastRow();
    if (last <= HEADER_ROW) return [];
    const matrix = ws.getRange(HEADER_ROW + 1, 0, last - HEADER_ROW, defs.length).getValues();
    return matrix.map((row) => {
      const rec: EntryRecord = {};
      defs.forEach((d, i) => {
        rec[d.field] = fromCellValue(d, row[i]);
      });
      return rec;
    });
  };

  /** 读单列的值（用于唯一性/统计等只需一列的场景） */
  const readColumn = (colIndex: number): unknown[] => {
    const ws = sheet.value;
    const rows = dataRowCount();
    if (!ws || rows <= 0) return [];
    const matrix = ws.getRange(HEADER_ROW + 1, colIndex, rows, 1).getValues();
    return matrix.map((row) => row[0]);
  };

  /** 表头文字：必填列追加星号（Univer 无表头分组/角标能力，用文本方式表达） */
  const headerTextOf = (d: ColDef): string => (d.required ? `${d.label} *` : d.label);

  /** 写表头行（含样式：加粗 + 浅底色 + 居中） */
  const writeHeader = (defs: ColDef[]) => {
    const ws = sheet.value;
    if (!ws || !defs.length) return;
    const range = ws.getRange(HEADER_ROW, 0, 1, defs.length);
    range.setValues([defs.map(headerTextOf)]);
    range.setFontWeight('bold');
    range.setBackground('#f1f4fb');
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
  };

  /** 写数据区：先清掉超出新数据量的历史残留，再整块 setValues（一次命令，撤销可整体回退） */
  const writeRecords = (defs: ColDef[], records: EntryRecord[]) => {
    const ws = sheet.value;
    if (!ws || !defs.length) return;
    const prevLast = lastRow();
    const rows = records.map((rec) => defs.map((d) => toCellValue(d, rec[d.field])));
    if (rows.length) {
      ws.getRange(HEADER_ROW + 1, 0, rows.length, defs.length).setValues(rows);
    }
    // 新数据比旧数据短：把尾巴清空，否则表头下方会残留上一批的旧行
    const staleStart = HEADER_ROW + 1 + rows.length;
    if (prevLast >= staleStart) {
      ws.getRange(staleStart, 0, prevLast - staleStart + 1, SHEET_COLUMN_COUNT).clearContent();
    }
    // 列数变少：清掉右侧残留列
    if (defs.length < SHEET_COLUMN_COUNT && prevLast > HEADER_ROW) {
      ws.getRange(HEADER_ROW, defs.length, prevLast - HEADER_ROW + 1, SHEET_COLUMN_COUNT - defs.length).clearContent();
    }
  };

  /** 列宽：按定义里的 px 值逐列设置（Univer 列宽单位即像素） */
  const applyColumnWidths = (defs: ColDef[]) => {
    const ws = sheet.value;
    if (!ws) return;
    defs.forEach((d, i) => ws.setColumnWidth(i, d.width));
  };

  /** 列可见性：隐藏列保留数据，只是不参与显示（与 vxe 的 visible=false 语义一致） */
  const applyColumnVisibility = (defs: ColDef[]) => {
    const ws = sheet.value;
    if (!ws) return;
    defs.forEach((d, i) => {
      if (d.visible) ws.showColumns(i);
      else ws.hideColumn(i);
    });
  };

  /**
   * 下发数据验证：只做 Univer 原生支持的两类，其余（正则/长度/跨列）由上层规则引擎兜底。
   *   - select → 下拉列表（可空、显示下拉箭头）
   *   - number 且配了 min/max → 数字区间
   * 区间按"数据行数 + 余量"给，避免每格一条规则把模型撑爆。
   */
  const applyDataValidation = (defs: ColDef[]) => {
    const ws = sheet.value;
    const api = apiInstance;
    if (!ws || !api) return;
    const cover = Math.min(SHEET_ROW_COUNT - HEADER_ROW - 1, Math.max(dataRowCount(), 300) + 200);
    defs.forEach((d, i) => {
      const colRange = ws.getRange(HEADER_ROW + 1, i, cover, 1);
      if (d.type === 'select' && d.options?.length) {
        const rule = api
          .newDataValidation()
          .requireValueInList(d.options, false, true)
          .setAllowBlank(true)
          .setOptions({ showErrorMessage: true, error: `${d.label}需从下拉选项中选择` })
          .build();
        colRange.setDataValidation(rule);
        return;
      }
      if (d.type === 'number' && d.rules?.min !== undefined && d.rules?.max !== undefined) {
        const rule = api
          .newDataValidation()
          .requireNumberBetween(d.rules.min, d.rules.max)
          .setAllowBlank(true)
          .setOptions({ showErrorMessage: true, error: `${d.label}需在 ${d.rules.min} ~ ${d.rules.max} 之间` })
          .build();
        colRange.setDataValidation(rule);
        return;
      }
      colRange.setDataValidation(null);
    });
  };

  /**
   * 条件格式：数值列数据条（对应 vxe 版的"数据条"色阶）。
   * 先按当前数据算出 min/max 再下发，避免用固定区间导致长条全都顶满。
   */
  const applyDataBars = (defs: ColDef[], on: boolean) => {
    const ws = sheet.value;
    if (!ws) return;
    // 每次重下发前先清掉本页下发的全部规则（规则由本页统一管理）
    ws.getConditionalFormattingRules().forEach((r) => {
      if (r.cfId) ws.deleteConditionalFormattingRule(r.cfId);
    });
    if (!on) return;
    const rows = dataRowCount();
    if (rows <= 0) return;
    defs.forEach((d, i) => {
      if (d.type !== 'number') return;
      const nums = readColumn(i)
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n));
      if (!nums.length) return;
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const rule = ws
        .newConditionalFormattingRule()
        .setDataBar({
          min: { type: 'num', value: min },
          max: { type: 'num', value: max },
          positiveColor: '#2b5cf6',
          nativeColor: '#f56c6c',
          isShowValue: true,
        })
        .setRanges([ws.getRange(HEADER_ROW + 1, i, Math.min(rows, 2000), 1).getRange()])
        .build();
      ws.addConditionalFormattingRule(rule);
    });
  };

  /** 冻结：表头行恒冻结；freezeFirstCol 决定是否再冻结首列（长表横向滚动时保姓名列可见） */
  const applyFreeze = (freezeFirstCol: boolean) => {
    const ws = sheet.value;
    if (!ws) return;
    ws.setFreeze({
      xSplit: freezeFirstCol ? 1 : 0,
      ySplit: HEADER_ROW + 1,
      startRow: HEADER_ROW + 1,
      startColumn: freezeFirstCol ? 1 : 0,
    });
  };

  /** 活动单元格（名称框语义） */
  const activeCellA1 = (): string => sheet.value?.getActiveCell()?.getA1Notation() ?? '—';

  /**
   * A1 地址 → 网格列索引（0-based）；解析失败返回 -1。
   * 用途：点列标会整列选中（A1 形如 "C:C"），上层据此打开该列的配置抽屉。
   */
  const columnOfA1 = (a1: string): number => {
    const ws = sheet.value;
    if (!ws || !a1) return -1;
    try {
      return ws.getRange(a1).getColumn();
    } catch {
      return -1;
    }
  };

  /** 当前选区覆盖的合并区域数量（状态栏展示用） */
  const mergeCount = (): number => sheet.value?.getMergeData().length ?? 0;

  /**
   * 合并当前选区。
   *
   * 三条硬约束（都来自"表头 + 数据行"这套模型）：
   *   1. 必须跨 ≥2 行或 ≥2 列，单格合并无意义；
   *   2. 不许碰表头行（HEADER_ROW）——表头被合并后 writeHeader 会把列名写进缝里；
   *   3. 不许跨"表头 / 数据"边界——那样数据行第一行会被吞进表头块。
   * 另外合并后只有左上角保留值，其余格读出来是空 → readRecords 会读到空字段，
   * 所以合并前的数据必须由调用方确认（本函数只管几何，不替用户判断业务合理性）。
   */
  const mergeSelection = (): { ok: boolean; msg: string } => {
    const ws = sheet.value;
    const sel = selection.value;
    if (!ws || !sel) return { ok: false, msg: '请先框选要合并的区域' };
    const range = ws.getRange(sel.a1).getRange();
    const spansRows = range.endRow - range.startRow >= 1;
    const spansCols = range.endColumn - range.startColumn >= 1;
    if (!spansRows && !spansCols) return { ok: false, msg: '至少选择 2 个单元格' };
    if (range.startRow <= HEADER_ROW) return { ok: false, msg: '表头行不允许合并（列名会被吞掉）' };
    // defaultMerge=false 会让 Univer 弹原生确认框（问"是否只保留左上角"），这里已由业务侧提示，直接 true
    ws.getRange(sel.a1).merge({ defaultMerge: true, isForceMerge: true });
    return { ok: true, msg: `已合并 ${sel.a1}` };
  };

  /** 拆掉本表全部合并（对应 vxe 版"取消合并（清除全部）"） */
  const clearAllMerges = (): number => {
    const ws = sheet.value;
    if (!ws) return 0;
    const list = ws.getMergeData();
    if (!list.length) return 0;
    // 逐个 breakApart：Univer 的 breakApart 只处理"本区间内"的合并，
    // 直接对每个已合并区域调用最省事，也避免整表 breakApart 把数据行一起扫一遍。
    list.forEach((r) => r.breakApart());
    return list.length;
  };

  /** 撤销 / 重做：走 Univer 命令栈（含数据验证、格式、填充分布等全部变更） */
  const undo = () => apiInstance?.undo();
  const redo = () => apiInstance?.redo();

  /** 当前选区左上角 + 尺寸（无选区时退化到活动单元格） */
  const selectionOrigin = (): { row: number; col: number; rows: number; cols: number } | null => {
    const sel = selection.value;
    const ws = sheet.value;
    if (sel && ws) {
      const range = ws.getRange(sel.a1);
      return { row: range.getRow(), col: range.getColumn(), rows: sel.rows, cols: sel.cols };
    }
    const active = ws?.getActiveCell();
    if (!active) return null;
    return { row: active.getRow(), col: active.getColumn(), rows: 1, cols: 1 };
  };

  return {
    ready,
    sheet,
    selection,
    revision,
    init,
    destroy,
    setDark,
    getApi,
    lastRow,
    dataRowCount,
    readRecords,
    readColumn,
    writeHeader,
    writeRecords,
    applyColumnWidths,
    applyColumnVisibility,
    applyDataValidation,
    applyDataBars,
    applyFreeze,
    activeCellA1,
    columnOfA1,
    mergeCount,
    mergeSelection,
    clearAllMerges,
    selectionOrigin,
    undo,
    redo,
  };
};

export type EntrySheet = ReturnType<typeof useEntrySheet>;
