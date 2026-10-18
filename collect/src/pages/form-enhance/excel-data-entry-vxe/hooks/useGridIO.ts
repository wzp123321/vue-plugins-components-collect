// 数据进出：Excel/CSV 导入导出 + 剪贴板复制粘贴（TSV 矩阵）
import type { Ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';

/**
 * 数据进出：Excel/CSV 导入导出 + 剪贴板复制粘贴（TSV 矩阵）。
 *
 * 在整体架构中的角色：本层是"外部数据与内部行模型"的双向桥。复制/粘贴的取源与落点都优先读
 * useCellSelection 的框选矩形，降级到 currentCell，与 useCopyMarquee 的蚂蚁线取源保持一致；
 * 粘贴按矩阵写入并逐列做类型校验（数字拒 NaN、下拉拒非选项、日期归一化），非法值跳过并计数提示。
 * 注意：导入/导出方向按需求仅做复用，不做新功能扩展。
 *
 * @param core 核心状态实例
 * @param fileInputRef 隐藏的文件 input ref（触发系统文件选择框）
 * @param sel 自研选区状态机（复制/粘贴的取源与锚点来源）
 */
export function useGridIO(core: GridCore, fileInputRef: Ref<HTMLInputElement | undefined>, sel: CellSelection) {
  const snap = () => core.pushSnapshot(core.snapshotNow());

  // ===================== 导入 =====================
  /** 触发系统文件选择框（点击隐藏的 file input），选中的文件交由 onFileChange 解析导入 */
  const importExcel = () => fileInputRef.value?.click();
  const onFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
      const labelField: Record<string, string> = {};
      for (const d of core.columnDefs.value) labelField[d.label] = d.field;
      snap();
      const rows = json.map((r) => {
        const row = core.makeRow();
        row.__dirty = true;
        for (const cn of Object.keys(r)) {
          const f = labelField[cn];
          if (f) row[f] = r[cn];
        }
        return row;
      });
      core.allRows.value = rows;
      for (const k of Object.keys(core.cellErrors)) delete core.cellErrors[k];
      core.revalidateAll();
      ElMessage.success(`已导入 ${rows.length} 行`);
    } catch (err) {
      ElMessage.error('导入失败：' + (err as Error).message);
    } finally {
      input.value = '';
    }
  };

  // ===================== 导出 =====================
  /** 把内部行模型投影为"列标签→值"的对象数组（导出 Excel/CSV 用，按 visibleDefs 顺序） */
  const buildExportRows = (source: any[]) =>
    source.map((r) => {
      const o: Record<string, any> = {};
      for (const d of core.visibleDefs.value) o[d.label] = r[d.field];
      return o;
    });

  const exportExcel = (scope: 'all' | 'result') => {
    const source = scope === 'all' ? core.allRows.value : core.processedRows.value;
    const ws = XLSX.utils.json_to_sheet(buildExportRows(source));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '录入数据');
    XLSX.writeFile(wb, scope === 'all' ? '数据录入_全部.xlsx' : '数据录入_结果.xlsx');
    ElMessage.success(`已导出 ${source.length} 行`);
  };
  const exportCsv = () => {
    const source = core.processedRows.value;
    const header = core.visibleDefs.value.map((d) => d.label);
    const rows = source.map((r) => core.visibleDefs.value.map((d) => `"${String(r[d.field] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = '﻿' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '数据录入_结果.csv';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success(`已导出 ${source.length} 行`);
  };
  const onExportCommand = (cmd: string) => {
    if (cmd === 'excelAll') exportExcel('all');
    else if (cmd === 'excelResult') exportExcel('result');
    else if (cmd === 'csv') exportCsv();
  };

  // ===================== 复制 / 粘贴 =====================
  /** 单元格值转字符串：null/undefined 视为空串（复制到剪贴板时不应出现 "null"/"undefined"） */
  const cellToStr = (v: any) => (v === null || v === undefined ? '' : String(v));
  /** 构建复制用的 TSV 文本：优先框选区域，无选区时降级当前单格（与 markCopied 取源一致） */
  const buildCopyTsv = (): string => {
    let tsv = '';
    // 优先复制框选区域（自研选区）
    const rect = sel.selRect.value;
    if (rect) {
      const rows = core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
      tsv = rows.map((r: any) => rect.fields.map((f: string) => cellToStr(r[f])).join('\t')).join('\n');
    }
    // 无框选时降级复制当前单格（复选框行复制已随行选中一并移除）
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
    const visFields = core.visibleDefs.value.map((d) => d.field);
    const rect = sel.selRect.value;
    if (rect) {
      const firstRow = core.processedRows.value.find((r) => rect.rowIds.has(r.__id));
      const col = visFields.indexOf(rect.fields[0]);
      if (firstRow && col >= 0) {
        return { startIdx: core.processedRows.value.indexOf(firstRow), startCol: col };
      }
    }
    if (core.currentCell.value) {
      const idx = core.processedRows.value.findIndex((r) => r.__id === core.currentCell.value!.row.__id);
      const col = visFields.indexOf(core.currentCell.value.field);
      return { startIdx: idx >= 0 ? idx : 0, startCol: col >= 0 ? col : 0 };
    }
    return { startIdx: 0, startCol: 0 };
  };

  // ⚠️ 坑：日期列粘贴值规范化——手工编辑经 el-date-picker 天然合法，粘贴是唯一能写入非法日期的入口，
  // 故必须在此对齐约束（与 date-picker 的 value-format 一致）。接受 2024-01-05 / 2024/1/5 / 2024年1月5日，
  // 统一为 YYYY-MM-DD；含闰年/月份天数校验，无法解析返回 null（交由上层跳过并提示）。
  const normalizeDate = (raw: string): string | null => {
    const m = raw.match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  /**
   * 应用粘贴的 TSV 文本：从锚点（选区左上角）起按矩阵写入，逐列做类型校验——
   * 数字列拒 NaN、下拉列拒非选项值、日期列经 normalizeDate 归一化，非法值跳过并计数提示；
   * 既有写入格统一 validateCell，新生成的行全字段校验；完成后闪烁高亮整个写入区。
   */
  const applyPasteText = (text: string) => {
    const rowsText = text.replace(/\r/g, '').split('\n').filter((l) => l.length);
    if (!rowsText.length) return;
    const grid = rowsText.map((r) => r.split('\t'));
    let visFields = core.visibleDefs.value.map((d) => d.field);
    const { startIdx, startCol } = resolvePasteAnchor();
    snap();
    // 粘贴宽度超出可见列时自动补列（Excel 里粘更宽的数据不该丢列）：
    // 新列一律 text 类型，label 用"粘贴列 N"，用户随后可在列设置里改类型/名称
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
        for (const r of core.allRows.value) r[def.field] = '';
      }
      addedCols = addN;
      visFields = core.visibleDefs.value.map((d) => d.field);
    }
    let skippedNaN = 0;
    let droppedCols = 0;
    let skippedSelect = 0;
    let skippedDate = 0;
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
        if (def?.type === 'number') {
          if (val === '') val = null;
          else {
            const n = Number(val);
            if (isNaN(n)) {
              skippedNaN++;
              continue;
            }
            val = n;
          }
        } else if (def?.type === 'select') {
          // ⚠️ 坑：下拉列非选项值必须跳过——直接写入会让显示标签与下拉编辑器双双异常
          // （标签渲染不存在的选项、下拉编辑器显示空白），等于把脏数据偷渡进库。
          // （标签渲染不存在的选项、下拉编辑器显示空白），等于把脏数据偷渡进库
          if (val !== '' && !(def.options ?? []).includes(val)) {
            skippedSelect++;
            continue;
          }
        } else if (def?.type === 'date' && val !== '') {
          const norm = normalizeDate(val);
          if (!norm) {
            skippedDate++;
            continue;
          }
          val = norm;
        }
        r[f] = val;
        r.__dirty = true;
        written.push({ r, f });
      }
      // 粘贴新生成的行也要跑全字段校验：只校验写入格的话，必填列缺失不会标红（与新增行不一致）
      if (isNew) core.validateRow(r);
    }
    // 统一对实际写入的格跑校验（新行上面已全量校验过，此处覆盖既有行路径并统计未通过数）
    let invalid = 0;
    for (const { r, f } of written) {
      core.validateCell(r, f);
      if (core.cellErrors[core.errKey(r.__id, f)]) invalid++;
    }
    // 粘贴区域闪烁反馈（与 Excel 粘贴后短暂高亮目标区一致；cellClassName 合并读取 core.flashKeys）
    if (written.length) core.flashCells(written.map(({ r, f }) => core.errKey(r.__id, f)), 900);
    ElMessage.success(`已粘贴 ${grid.length} 行 × ${grid[0].length} 列`);
    if (addedCols) ElMessage.info(`粘贴宽度超出可见列，已自动新增 ${addedCols} 个文本列`);
    if (invalid) ElMessage.warning(`${invalid} 个单元格未通过校验（必填/格式），已标红`);
    if (skippedNaN) ElMessage.warning(`${skippedNaN} 个非数字内容已跳过（数字列只接受数值）`);
    if (skippedSelect) ElMessage.warning(`${skippedSelect} 个下拉列内容不在可选项中，已跳过`);
    if (skippedDate) ElMessage.warning(`${skippedDate} 个日期格式无法识别，已跳过（支持 2024-01-05 / 2024/1/5 / 2024年1月5日）`);
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
    importExcel,
    onFileChange,
    onExportCommand,
    buildCopyTsv,
    copySelection,
    applyPasteText,
    pasteFromClipboard,
  };
}

/**
 * useGridIO 的返回类型别名：导出 importExcel / onFileChange / onExportCommand / buildCopyTsv /
 * copySelection / applyPasteText / pasteFromClipboard，供工具栏与右键菜单调用。
 */
export type GridIO = ReturnType<typeof useGridIO>;
