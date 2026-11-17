// 剪贴板进出：复制 / 粘贴（TSV 矩阵）
// 对齐 Univer 录入台：数据进出只保留剪贴板通道，工具条不提供文件导入/导出入口。
import { ElMessage } from 'element-plus';
import { rowIdOf, type GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';
import { normalizeDate } from '@/utils/bi-entry';
import { findRegionByName, isRegionValue } from '@/pages/data-platform/univer-entry/region-data';

/**
 * 行标脏助手：__dirty 是 vxe 消费的行字段（属性名属外部约定、不可重命名），
 * 统一经 Object.assign 写入，避免直接读写下划线属性触发 no-underscore-dangle。
 */
const markDirty = (r: { __dirty: boolean }): void => {
  Object.assign(r, { __dirty: true });
};

// ⚠️ 坑：日期列粘贴值规范化——手工编辑经 el-date-picker 天然合法，粘贴是唯一能写入非法日期的入口，
// 故必须在此对齐约束（与 date-picker 的 value-format 一致）。接受 2024-01-05 / 2024/1/5 / 2024年1月5日，
// 统一为 YYYY-MM-DD；含闰年/月份天数校验，无法解析返回 null（交由上层跳过并计数提示）。

/**
 * 剪贴板进出：复制 / 粘贴（TSV 矩阵）。
 *
 * 在整体架构中的角色：把系统剪贴板与内部行模型双向打通。复制/粘贴的取源与落点都优先读
 * useCellSelection 的框选矩形，降级到 currentCell，与 useCopyMarquee 的蚂蚁线取源保持一致；
 * 粘贴按矩阵写入并逐列做类型校验（数字拒 NaN、下拉拒非选项、日期归一化、院区按名称反查），
 * 非法值跳过并计数提示。
 *
 * @param core 核心状态实例
 * @param sel 自研选区状态机（复制/粘贴的取源与锚点来源）
 */
export const useGridIO = (core: GridCore, sel: CellSelection) => {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 复制 / 粘贴 =====================
  /** 单元格值转字符串：null/undefined 视为空串；院区对象只输出院区名称（对齐 Univer 的 displayTextOf） */
  const cellToStr = (v: any): string => {
    if (v === null || v === undefined) return '';
    return isRegionValue(v) ? v.name : String(v);
  };
  /** 构建复制用的 TSV 文本：优先框选区域，无选区时降级当前单格（与 markCopied 取源一致） */
  const buildCopyTsv = (): string => {
    let tsv = '';
    const rect = sel.selRect.value;
    if (rect) {
      const fields = sel.rectFields(rect);
      tsv = sel
        .rectRows(rect)
        .map((r: any) => fields.map((f: string) => cellToStr(r[f])).join('\t'))
        .join('\n');
    }
    if (!tsv && core.currentCell.value) {
      tsv = cellToStr(core.currentCell.value.row[core.currentCell.value.field]);
    }
    return tsv;
  };
  /**
   * 写入系统剪贴板（供右键菜单"复制"调用，绕开键盘事件的 clipboardData）。
   * @returns 是否复制成功——调用方据此决定是否亮蚂蚁线
   */
  const copySelection = async (): Promise<boolean> => {
    const tsv = buildCopyTsv();
    if (!tsv) {
      ElMessage.info('没有可复制的内容');
      return false;
    }
    try {
      await navigator.clipboard.writeText(tsv);
      ElMessage.success('已复制到剪贴板');
      return true;
    } catch {
      ElMessage.warning('复制失败，请检查浏览器剪贴板权限');
      return false;
    }
  };
  // 粘贴锚点：优先取自研框选区域左上角（与 Excel 一致），降级 currentCell → 首格
  const resolvePasteAnchor = (): { startIdx: number; startCol: number } => {
    const rect = sel.selRect.value;
    if (rect) return { startIdx: rect.topIdx, startCol: rect.leftIdx };
    if (core.currentCell.value) {
      const visFields = core.visibleDefs.value.map((d) => d.field);
      const idx = core.processedRows.value.findIndex((r) => rowIdOf(r) === rowIdOf(core.currentCell.value!.row));
      const col = visFields.indexOf(core.currentCell.value.field);
      return { startIdx: idx >= 0 ? idx : 0, startCol: col >= 0 ? col : 0 };
    }
    return { startIdx: 0, startCol: 0 };
  };

  /**
   * 应用粘贴的 TSV 文本：从锚点起按矩阵写入，逐列做类型校验——
   * 数字列拒 NaN、下拉列拒非选项值、日期列归一化、院区列按名称反查成结构化对象，
   * 非法值跳过并计数提示；完成后闪烁高亮整个写入区。
   */
  const applyPasteText = (text: string) => {
    const rowsText = text.replace(/\r/g, '').split('\n').filter((l) => l.length);
    if (!rowsText.length) return;
    const grid = rowsText.map((r) => r.split('\t'));
    let visFields = core.visibleDefs.value.map((d) => d.field);
    const { startIdx, startCol } = resolvePasteAnchor();
    snap();
    // 粘贴宽度超出可见列时自动补列（Excel 里粘更宽的数据不该丢列）：新列一律 text 类型
    let addedCols = 0;
    const needCols = startCol + grid.reduce((m, r) => Math.max(m, r.length), 0);
    if (needCols > visFields.length) {
      const addN = needCols - visFields.length;
      const stamp = Date.now().toString(36);
      for (let i = 0; i < addN; i++) {
        const def = {
          field: `paste_${stamp}_${i}`,
          label: `粘贴列 ${visFields.length + i + 1}`,
          type: 'text' as const,
          visible: true,
          width: 120,
        };
        core.columnDefs.value.push(def);
        core.allRows.value.forEach((r) => {
          r[def.field] = '';
        });
      }
      addedCols = addN;
      visFields = core.visibleDefs.value.map((d) => d.field);
    }
    let skippedNaN = 0;
    let droppedCols = 0;
    let skippedSelect = 0;
    let skippedDate = 0;
    let skippedRegion = 0;
    const written: { r: any; f: string }[] = [];
    for (let i = 0; i < grid.length; i++) {
      let r: any = core.processedRows.value[startIdx + i];
      const isNew = !r;
      if (!r) {
        r = core.makeRow();
        core.allRows.value.push(r);
      }
      for (let j = 0; j < grid[i].length; j++) {
        const f = visFields[startCol + j];
        if (!f) {
          droppedCols += grid[i].length - j;
          break;
        }
        const def = core.columnDefs.value.find((d) => d.field === f);
        let val: any = grid[i][j];
        // 非法值不写入、不标脏、不入 written（用 skip 标记替代 continue）
        let skip = false;
        if (def?.type === 'number') {
          if (val === '') {
            val = null;
          } else {
            const n = Number(val);
            if (Number.isNaN(Number(n))) {
              skippedNaN++;
              skip = true;
            } else {
              val = n;
            }
          }
        } else if (def?.type === 'select') {
          // ⚠️ 坑：下拉列非选项值必须跳过——直接写入会让显示标签与下拉编辑器双双异常
          if (val !== '' && !(def.options ?? []).includes(val)) {
            skippedSelect++;
            skip = true;
          }
        } else if (def?.type === 'date' && val !== '') {
          const norm = normalizeDate(val);
          if (!norm) {
            skippedDate++;
            skip = true;
          } else {
            val = norm;
          }
        } else if (def?.type === 'region' && val !== '') {
          // 院区列粘贴的是名称：反查成 { name, id, code }，查不到视为未选（与 Univer 的 fromCellValue 同口径）
          const hit = findRegionByName(val);
          if (hit) val = { ...hit };
          else {
            skippedRegion++;
            skip = true;
          }
        }
        if (!skip) {
          r[f] = val;
          markDirty(r);
          written.push({ r, f });
        }
      }
      // 粘贴新生成的行也要跑全字段校验：只校验写入格的话，必填列缺失不会标红
      if (isNew) core.validateRow(r);
    }
    let invalid = 0;
    written.forEach(({ r, f }) => {
      core.validateCell(r, f);
      if (core.cellErrors[core.errKey(rowIdOf(r), f)]) invalid++;
    });
    if (written.length) core.flashCells(written.map(({ r, f }) => core.errKey(rowIdOf(r), f)), 900);
    core.bumpData();
    ElMessage.success(`已粘贴 ${grid.length} 行 × ${grid[0].length} 列`);
    if (addedCols) ElMessage.info(`粘贴宽度超出可见列，已自动新增 ${addedCols} 个文本列`);
    if (invalid) ElMessage.warning(`${invalid} 个单元格未通过校验（必填/格式），已标红`);
    if (skippedNaN) ElMessage.warning(`${skippedNaN} 个非数字内容已跳过（数字列只接受数值）`);
    if (skippedSelect) ElMessage.warning(`${skippedSelect} 个下拉列内容不在可选项中，已跳过`);
    if (skippedDate) ElMessage.warning(`${skippedDate} 个日期格式无法识别，已跳过（支持 2024-01-05 / 2024/1/5 / 2024年1月5日）`);
    if (skippedRegion) ElMessage.warning(`${skippedRegion} 个院区名称不在院区列表中，已跳过`);
    if (droppedCols) ElMessage.warning(`粘贴宽度超出可见列范围，${droppedCols} 列内容已忽略`);
  };
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) applyPasteText(text);
      else ElMessage.info('剪贴板为空');
    } catch {
      ElMessage.warning('粘贴失败，请检查浏览器剪贴板权限');
    }
  };

  return {
    buildCopyTsv,
    copySelection,
    applyPasteText,
    pasteFromClipboard,
  };
};

/**
 * useGridIO 的返回类型别名：导出 buildCopyTsv / copySelection / applyPasteText /
 * pasteFromClipboard，供右键菜单与键盘层调用。
 */
export type GridIO = ReturnType<typeof useGridIO>;
