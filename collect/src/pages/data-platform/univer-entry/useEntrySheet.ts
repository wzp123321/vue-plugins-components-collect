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
import { DataValidationRenderMode, createUniver, LocaleType, mergeLocales, defaultTheme } from '@univerjs/presets';
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
  HEADER_BG_LIGHT,
  HEADER_BORDER_COLOR,
  HEADER_ROW,
  HEADER_ROW_HEIGHT,
  SHEET_COLUMN_COUNT,
  SHEET_ROW_COUNT,
  fromCellValue,
  toCellValue,
  type ColDef,
  type EntryRecord,
} from './schema';
import { findRegionByName, isRegionValue, type RegionValue } from './region-data';
import type { UApi, UIRange, USheet, UWorkbook } from './univer-types';

/**
 * Univer 主题：整体替换（ThemeService 不合并，必须全量透传 official defaultTheme）。
 *
 * ⚠️ 暗色**不要另传一套暗色主题**。Univer 的暗色是「反色」实现的：
 *   `CanvasColorService.getRenderColor()` 先按主题键解析出真实颜色，再在 `themeService.darkMode`
 *   为真时用反色矩阵把颜色翻过来。所以「暗色主题 + 打开暗黑开关」= 把已经很暗的颜色再翻成亮色，
 *   画布反而是白的（踩过两次的坑）。正确组合只有一种：**始终喂亮色基调主题 + toggleDarkMode(dark)**
 *   —— 白底翻黑、深字翻浅，React 浮层也同步走暗色，画布与浮层口径一致。
 *
 * ⚠️ 同理，任何「写进单元格的颜色」（如表头底色）都要写**亮色值**，让它被统一反转；
 *   若按 html.dark 写深色，反转后会变成亮色，表头在暗黑下反而发白。
 *
 * ⚠️ highlight.background[i].color 必须是「主题键路径」（如 "orange.400"），Univer 渲染时
 *   按 get(theme, color) 解析；填十六进制字符串会被解析成 theme["#ff8f1f"] → undefined 而失效。
 */
// 品牌主色尺：与 vxe(--dt-primary)/vtable-sheet(--bi-primary) 同源，选区 / 强调统一为这套蓝
const BRAND_PRIMARY_LIGHT = {
  50: '#eef2ff', 100: '#e2e9ff', 200: '#c9d6ff', 300: '#a9bcff', 400: '#7d97ff',
  500: '#2b5cf6', 600: '#1f4ee0', 700: '#1a40bd', 800: '#153399', 900: '#102678',
};

const buildUniverTheme = () => {
  // 查找高亮：与 vxe 的 .cell-found（橙底）同源；color 用主题键路径，alpha 仿官方 0.28/0.14 两档
  const highlight = { background: {} as Record<number, { color: string; alpha: number }> };
  for (let i = 1; i <= 16; i += 1) {
    highlight.background[i] = { color: 'orange.400', alpha: i <= 8 ? 0.28 : 0.14 };
  }
  return {
    ...defaultTheme,
    primary: BRAND_PRIMARY_LIGHT,
    highlight,
  };
};

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
 * 判定"点击"的最大指针位移（px）。
 * Univer 的 CellClicked 最终挂在浏览器的 click 事件上，而**拖拽结束后同样会补一个 click**：
 * 拖右下角 ▢ 填充柄做序列填充、按住拖选一片区域，松手都会走到 CellClicked。
 * 位移超过该阈值即视为拖拽，不当作"点了这个单元格"（页面据此决定要不要弹院区选择框）。
 */
const CLICK_SLOP_PX = 4;

/**
 * 创建并托管 Univer 实例。
 * 返回的读写方法全部是命令式的（内部读 Facade API），调用方不必关心实例细节。
 */
export const useEntrySheet = () => {
  // Univer 实例与 API：绝不能进 ref/reactive（会代理内部模型导致渲染异常）
  let univerInstance: { dispose: () => void } | null = null;
  let apiInstance: UApi | null = null;
  /** 当前工作簿句柄：清空选区等命令需要 unitId */
  let workbookRef: UWorkbook | null = null;
  /** 画布容器：用来挂指针监听（判断"这次到底是不是一次点击"） */
  let containerEl: HTMLElement | null = null;
  /** 本次按下的位置；pointerup 时用来算位移 */
  let pointerStart: { x: number; y: number } | null = null;
  /**
   * "用户点中了某一格"的订阅者（页面用它弹下拉列表、弹院区选择框）。
   *
   * ⚠️ 没有用 Univer 的 `CellClicked` 事件：sheets-ui 那边是
   *   `FUniver._initObserverListener` 在「出现 sheet + Lifecycle ≥ Rendered」时才订阅
   *   `HoverManagerService.currentClickedCell$`，本页实测始终收不到
   *   （DOM 的 pointerdown/mousedown/click 确实都落在 canvas 上，回调却不触发；
   *   早前"双击院区列弹选择框"其实也依赖它，所以那条路同样是哑的）。
   * 这里改成自己判：容器内 pointerdown → window pointerup，位移未超阈值即视为点击，
   * 再读当前选区左上角那一格。不依赖 Univer 内部事件时序，也天然排除拖选 / 拖填充柄。
   */
  let cellPickCb: ((params: { row: number; column: number }) => void) | null = null;

  const ready = ref(false);
  const sheet = shallowRef<USheet | null>(null);
  const selection = ref<SelectionInfo | null>(null);
  /** 命令执行计数：每有数据/结构变更自增一次，供上层用 watch 触发重算 */
  const revision = ref(0);

  /**
   * 松手认定成"点击"后，把这次点中的格报给订阅者。
   *
   * 同步读 `getActiveCell()` 而不是 `selection` ref：Univer 的 selection 快照是在 pointerup
   * **之后**（click 阶段）才刷新的，pointerup 里读 ref 拿到的是 null（实测）；
   * 活动格则在 pointerdown 时就已经落到文档模型里，pointerup 读它拿到的就是这次点中的那一格。
   * 同步上报还有个额外好处：双击的 dblclick 回调能立刻拿到坐标（异步上报会晚于 dblclick）。
   * 单格点击才会走到这里（拖选 / 拖填充柄在 pointerup 就返回了），所以不必再校验选区大小。
   */
  const emitCellClick = () => {
    const cb = cellPickCb;
    const ws = sheet.value;
    if (!cb || !ws) return;
    const active = ws.getActiveCell();
    if (!active) return;
    cb({ row: active.getRow(), column: active.getColumn() });
  };

  let commandTimer: number | null = null;
  const bumpRevision = () => {
    if (commandTimer) window.clearTimeout(commandTimer);
    commandTimer = window.setTimeout(() => {
      commandTimer = null;
      revision.value++;
    }, COMMAND_DEBOUNCE_MS);
  };

  /** 默认工作簿快照：单 sheet，行/列数一次给足（避免边录边扩行触发整表重排） */  const buildWorkbookData = () => ({
    id: 'univer-bi-entry',
    name: 'BI 数据录入',
    sheetOrder: ['sheet-bi-entry'],
    sheets: {
      'sheet-bi-entry': {
        id: 'sheet-bi-entry',
        name: '录入数据',
        rowCount: SHEET_ROW_COUNT,
        columnCount: SHEET_COLUMN_COUNT,
        // 行高与字号对齐另两套录入台（vxe 行高 36 / 字号 12.5，vtable-sheet 行高 36 / 字号 12）。
        // Univer 默认 20px 行高 + 11pt 字号，三页并排时密度差最明显。
        defaultRowHeight: ENTRY_ROW_HEIGHT,
        // ff 接应用字体（与 .bi-page 同款字体栈），否则 Univer 用自带默认字体，三页并排时字形不一致。
        // vt: 2 = VerticalAlign.MIDDLE，36px 行高里文字居中，不然默认贴底显得局促。
        defaultStyle: {
          fs: ENTRY_FONT_SIZE,
          ff: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          vt: 2,
        },
        cellData: {},
      },
    },
  });

  // ===================== 指针监听：区分「点击」与「拖拽」 =====================
  /** 记录按下的起点；松手时算位移，位移超阈值就标记"这次是拖拽" */
  const onPointerDown = (e: PointerEvent) => {
    pointerStart = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = pointerStart;
    pointerStart = null;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > CLICK_SLOP_PX) return;
    emitCellClick();
  };
  const onPointerCancel = () => {
    pointerStart = null;
  };

  /** 初始化：挂载容器，实例化 Univer 并创建空工作簿 */
  const init = (container: HTMLElement) => {
    if (univerInstance) return;
    containerEl = container;
    container.addEventListener('pointerdown', onPointerDown, true);
    // pointerup / cancel 挂 window：拖到画布外松手也要能收到，否则抑制标记会漏
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerCancel, true);
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
        // showEditOnDropdown：弹层底部「编辑」会打开 Univer 自己的数据验证侧边栏，
        //   与页面的列配置抽屉形成两份真相源，关掉；
        // showSearchOnDropdown：搜索框在 SelectList 里是 autoFocus 的，会抢走键盘焦点，
        //   把"直接打字改值"变成"筛选选项"，而本页下拉列只有 3~5 个候选，用不上。
        UniverSheetsDataValidationPreset({ showEditOnDropdown: false, showSearchOnDropdown: false }),
        UniverSheetsConditionalFormattingPreset(),
      ],
    });
    univerInstance = univer as unknown as { dispose: () => void };
    const api = univerAPI as unknown as UApi;
    apiInstance = api;
    const workbook = api.createWorkbook(buildWorkbookData());
    workbookRef = workbook;
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
    containerEl?.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointerup', onPointerUp, true);
    window.removeEventListener('pointercancel', onPointerCancel, true);
    containerEl = null;
    pointerStart = null;
    cellPickCb = null;
    univerInstance?.dispose();
    univerInstance = null;
    apiInstance = null;
    workbookRef = null;
    sheet.value = null;
    selection.value = null;
    ready.value = false;
  };

  /**
   * 明暗主题：跟随站点 html.dark。
   *   - setTheme：始终是**亮色基调**（品牌灰阶/品牌色），暗色不另传主题——见 buildUniverTheme 注释，
   *     Univer 暗色是反色实现的，喂暗色主题会被翻回去；
   *   - toggleDarkMode：真正的明暗开关，画布反色 + React 浮层切暗色一起生效。
   */
  const setDark = (dark: boolean) => {
    if (!apiInstance) return;
    apiInstance.setTheme(buildUniverTheme());
    apiInstance.toggleDarkMode(dark);
  };

  /** Facade API 出口：查找替换等少数能力需要直接调 univerAPI（没有对应的 sheet 方法） */
  const getApi = (): UApi | null => apiInstance;

  /** 当前已有数据的最大行号（0-based，含表头）；无数据返回 -1 */
  const lastRow = (): number => sheet.value?.getLastRow() ?? -1;

  /** 当前数据行数（不含表头） */
  const dataRowCount = (): number => Math.max(0, lastRow() - HEADER_ROW);

  /**
   * 读整表：表头行跳过，按列定义把原始单元格矩阵还原成记录数组。
   * ⚠️ 用 getCellDatas() 而不是 getValues()：后者只返回 cell.v，院区列存在
   *    ICellData.custom 里的 id / code 会读不到，整列退化成空值。
   * ⚠️ 有日期列时**额外**读一次 getDisplayValues()：日期格的 v 是序列号（45352），
   *    "这是真日期还是随手敲的数字"只能靠显示文本区分（详见 schema.fromCellValue 的日期分支）。
   */
  const readRecords = (defs: ColDef[]): EntryRecord[] => {
    const ws = sheet.value;
    if (!ws || !defs.length) return [];
    const last = lastRow();
    if (last <= HEADER_ROW) return [];
    const range = ws.getRange(HEADER_ROW + 1, 0, last - HEADER_ROW, defs.length);
    const matrix = range.getCellDatas();
    const hasDate = defs.some((d) => d.type === 'date');
    const displays = hasDate ? range.getDisplayValues() : null;
    return matrix.map((row, r) =>
      defs.reduce<EntryRecord>((rec, d, i) => {
        rec[d.field] = fromCellValue(d, row[i], displays?.[r]?.[i]);
        return rec;
      }, {}),
    );
  };

  /** 读单列的值（用于唯一性/统计等只需一列的场景） */
  const readColumn = (colIndex: number): unknown[] => {
    const ws = sheet.value;
    const rows = dataRowCount();
    if (!ws || rows <= 0) return [];
    const matrix = ws.getRange(HEADER_ROW + 1, colIndex, rows, 1).getValues();
    return matrix.map((row) => row[0]);
  };

  // ===================== 单元格点击订阅与院区列读写 =====================
  /**
   * 订阅"用户点中了某一格"（row / column 均为 0-based）。
   * 信号源是容器内的指针抬起 + 当前单格选区，不是 Univer 的 CellClicked 事件（原因见 cellPickCb 注释）。
   * 只保留一份订阅，重复调用会覆盖旧的。
   */
  const onCellClick = (cb: (params: { row: number; column: number }) => void) => {
    cellPickCb = cb;
  };

  /** 读某个院区单元格的当前值：优先取 custom，手工输入导致 custom 丢失时按名称反查 */
  const getRegionValue = (row: number, col: number): RegionValue | null => {
    const cell = sheet.value?.getRange(row, col).getCellDatas()[0]?.[0] ?? null;
    const custom = cell?.custom;
    if (isRegionValue(custom)) {
      return { name: custom.name, id: custom.id, code: custom.code };
    }
    return findRegionByName(cell?.v);
  };

  /**
   * 写某个院区单元格：v 存名称（原生渲染），custom 存完整业务对象。
   * 传 null 表示清空——必须同时把 custom 置 null，否则下次读回会拿到旧的 id/code。
   */
  const setRegionCell = (row: number, col: number, region: RegionValue | null) => {
    const ws = sheet.value;
    if (!ws) return;
    ws.getRange(row, col).setValue(
      region
        ? { v: region.name, custom: { name: region.name, id: region.id, code: region.code } }
        : { v: '', custom: null },
    );
  };

  /**
   * 读某个普通文本单元格（下拉列点击时用于回显当前值）。
   * 走 getValues 只拿 v，与 setCellText 对称。
   */
  const getCellText = (row: number, col: number): string => {
    const ws = sheet.value;
    if (!ws) return '';
    const v = ws.getRange(row, col).getValues()[0]?.[0];
    return v === null || v === undefined ? '' : String(v);
  };

  /**
   * 写某个普通文本单元格（下拉列由点击弹层回填时用）。
   * 传空串表示清空；不碰 custom，避免把院区那种带业务对象的单元格写坏。
   */
  const setCellText = (row: number, col: number, text: string) => {
    const ws = sheet.value;
    if (!ws) return;
    ws.getRange(row, col).setValue(text);
  };

  /**
   * UniverSheetsFilterPreset 只注册了筛选能力，漏斗按钮由 SheetsFilterRenderController
   * 在 filterModel 有 range 时才绘制；本页隐藏了 ribbon（header:false / toolbar:false），
   * 没有官方的「开关筛选」菜单，所以必须主动 createFilter() 建筛选区。
   * 约束（对 1.3.0 源码核过）：createFilter 要求 endRow > startRow（至少表头 + 1 行），
   * 且表上已有 filter 时直接返回 null → 覆盖范围变化要先 remove() 再建。
   * 覆盖范围够用时直接返回，避免把用户已设的筛选条件清掉。
   */
  const ensureFilter = (colCount: number) => {
    const ws = sheet.value;
    if (!ws || colCount <= 0) return;
    const last = Math.max(lastRow(), HEADER_ROW + 1);
    const existing = ws.getFilter();
    if (existing) {
      const r = existing.getRange().getRange();
      if (r.endColumn >= colCount - 1 && r.endRow >= last) return;
      existing.remove();
    }
    ws.getRange(HEADER_ROW, 0, last - HEADER_ROW + 1, colCount).createFilter();
  };

  /** 表头文字：必填列追加星号（Univer 无表头分组/角标能力，用文本方式表达） */
  const headerTextOf = (d: ColDef): string => (d.required ? `${d.label} *` : d.label);

  /** 写表头行（含样式：加粗 + 底色 + 居中 + 下边框 + 行高）。底色跟随站点暗黑，避免暗模式下仍是浅蓝灰 */
  const writeHeader = (defs: ColDef[]) => {
    const ws = sheet.value;
    if (!ws || !defs.length) return;
    const range = ws.getRange(HEADER_ROW, 0, 1, defs.length);
    range.setValues([defs.map(headerTextOf)]);
    range.setFontWeight('bold');
    // 恒写亮色表头底：暗黑由 Univer 反色统一处理（写暗色底会被反转成亮色，表头反而发白）
    range.setBackground(HEADER_BG_LIGHT);
    range.setHorizontalAlignment('center');
    range.setVerticalAlignment('middle');
    // 表头行比数据行高一档 + 一条下边框，把"列名区"和"数据区"分开（画布表格默认只有网格线，
    // 表头和数据行视觉上是一整片，行多时容易看串行）
    ws.setRowHeight(HEADER_ROW, HEADER_ROW_HEIGHT);
    range.setBorder('bottom', 1, HEADER_BORDER_COLOR);
  };

  /**
   * 写数据区：先清掉超出新数据量的历史残留，再整块 setValues（一次命令，撤销可整体回退）。
   * 矩阵允许「标量 + ICellData」混合：院区列的 toCellValue 返回 { v, custom }，
   * FRange.setValues 逐格调 covertCellValue，official 1.3.0 明确支持这种混合写法。
   */
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
      const staleRows = prevLast - staleStart + 1;
      ws.getRange(staleStart, 0, staleRows, SHEET_COLUMN_COUNT).clearContent();
      // clearContent 走 ClearSelectionContentCommand，不清 ICellData.custom；
      // 院区列的残留 custom 会让 lastRow() 误判还有数据，必须显式清掉
      defs.forEach((d, i) => {
        if (d.type !== 'region') return;
        const clearing = Array.from({ length: staleRows }, () => [{ v: '', custom: null }]);
        ws.getRange(staleStart, i, staleRows, 1).setValues(clearing);
      });
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
   * 下发数据验证。列类型只有两种会挂规则：
   *   - number 且配了 min/max → 数字区间（规则本身不画任何角标，不干扰录入）；
   *   - select → LIST 规则 + **renderMode: TEXT**（数值枚举 0）：静态只画纯文本，不画右侧那个常驻箭头
   *     （1.3.0 只有 ARROW/CUSTOM 才画，不传等同于 CUSTOM —— 早期"挂规则就整列常驻箭头"
   *     是把默认渲染模式当成了唯一形态，于是干脆不挂规则、改用自研弹层；
   *     另注意它是数值枚举，传字符串 'TEXT' 会被静默忽略、照样画箭头）。
   *     平时单元格与普通文本格一模一样；聚焦（点中）时由页面调 showOptionDropdown()
   *     主动弹出原生选项列表，选完自动收起。
   *   - showErrorMessage 置 false：非法值照常写入、不弹 Univer 自己的错误框，
   *     红框仍由行级校验（useEntryRules）统一负责，避免两套校验口径打架。
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
          .requireValueInList([...d.options])
          .setAllowBlank(true)
          .setOptions({ showErrorMessage: false, renderMode: DataValidationRenderMode.TEXT })
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
   * 弹出某格的原生数据验证下拉（必须该格挂着 LIST 规则）。
   * 由页面在"点中下拉列单元格"时调用；命令本身不检查 renderMode、也不要求进入编辑态，
   * 弹层锚在该单元格下方，选中后 Univer 直接写值（SetRangeValuesCommand）并收起。
   * 命令是幂等的：同一格重复下发不会闪一下再开（handler 里先比对 activeDropdown 位置）。
   */
  const showOptionDropdown = (row: number, column: number): void => {
    const api = apiInstance;
    const ws = sheet.value;
    const wb = workbookRef;
    if (!api || !ws || !wb) return;
    // 命令失败只会导致"点了没弹层"，不影响数据，故吞掉异常（无 catch 会变成 unhandled rejection）
    api
      .executeCommand('sheet.operation.show-data-validation-dropdown', {
        unitId: wb.getId(),
        subUnitId: ws.getSheetId(),
        row,
        column,
      })
      .catch(() => undefined);
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

  /** 冻结：表头行恒冻结；freezeFirstCol 决定是否再冻结首列（本页传 false，不固定任何列） */
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
   * 把选区收到指定单元格。
   * 用途：列结构重下发（写表头 / 显隐列 / 数据验证等都是整列 range 操作）会把 active cell
   * 挪到最后一列，出现"一进页面就选中备注列"，由上层在重下发后统一复位。
   */
  const focusCell = (row: number, column: number) => {
    const ws = sheet.value;
    if (!ws) return;
    ws.getRange(row, column).activate();
  };

  /**
   * 清空选区（进页面时"什么都不选中"）。
   *
   * Facade 没有提供 clear 方法，只能下发 SetSelectionsOperation。这里要两步：
   *   1. 先把选区挪到**可视区外**的一格（AO1）。Univer 除了 `selections` 还单独记了一份
   *      "上次活动格"（lastSelectionPrimaryCell），只有非空选区才会更新它；
   *      若直接下发空数组，画布上仍会残留旧活动格的 2px 蓝框 —— 也就是"表头看起来被选中"。
   *      把活动格挪到视口外，这个框就落在看不见的地方。
   *   2. 再下发空数组，让选区列表也空掉（否则状态栏"选中"会是 1）。
   * 两步都不带 reveal，画布不会滚动，用户看到的仍是左上角。
   * 命令不可用（版本签名变化）时返回 false，调用方退回"定位到第一个数据格"。
   */
  const clearSelection = async (): Promise<boolean> => {
    const api = apiInstance;
    const ws = sheet.value;
    const wb = workbookRef;
    if (!api || !ws || !wb) return false;
    const unitId = wb.getId();
    const subUnitId = ws.getSheetId();
    const park = { startRow: 0, startColumn: SHEET_COLUMN_COUNT - 1, endRow: 0, endColumn: SHEET_COLUMN_COUNT - 1 };
    try {
      const moved = await api.executeCommand('sheet.operation.set-selections', {
        unitId,
        subUnitId,
        selections: [
          {
            range: park,
            primary: { ...park, actualRow: 0, actualColumn: SHEET_COLUMN_COUNT - 1 },
            style: null,
          },
        ],
      });
      if (!moved) return false;
      await api.executeCommand('sheet.operation.set-selections', { unitId, subUnitId, selections: [] });
      selection.value = null;
      return true;
    } catch {
      return false;
    }
  };

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
    onCellClick,
    getRegionValue,
    setRegionCell,
    setCellText,
    getCellText,
    ensureFilter,
    writeHeader,
    writeRecords,
    applyColumnWidths,
    applyColumnVisibility,
    applyDataValidation,
    showOptionDropdown,
    applyDataBars,
    applyFreeze,
    activeCellA1,
    focusCell,
    clearSelection,
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
