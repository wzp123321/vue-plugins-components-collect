// 数据进出：Excel / CSV 导入导出（浏览器端，纯开源包 SheetJS 实现）
// ============================================================================
// 本文件职责：
//   1. 导入 .xlsx/.xls：按表头文字匹配列定义，逐格按列类型归一化（数字/日期/下拉），覆盖前二次确认；
//   2. 导出 xlsx / csv：按可见列投影导出。
//
// 与 Univer 版的关系：归一化与写盘逻辑一致（同一套列类型口径）；差异仅在"读写通道"——
//   Tabulator 的 writeRecords 直接吃记录数组，无需 HEADER_ROW / 网格坐标。导入前先 snapshot 入撤销栈。
// ============================================================================
import type { Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { isBlank, normalizeDate, formatDate, pad2, fromCellValue, type ColDef, type EntryRecord } from './schema';
import type { EntrySheet } from './useEntrySheet';

/** 导入单格归一化结果：ok=false 表示该值不符合列类型（由调用方跳过并计数） */
type ImportCell = { ok: true; value: unknown } | { ok: false };

/**
 * 导入值按列类型归一化。
 * 要吞掉 Excel 的两种日期形态：Date 对象（cellDates 开启时）与天数序列号（45292）。
 */
const normalizeImportValue = (def: ColDef, raw: unknown): ImportCell => {
  if (def.type === 'number') {
    if (isBlank(raw)) return { ok: true, value: null };
    const n = Number(raw);
    return Number.isNaN(n) ? { ok: false } : { ok: true, value: n };
  }
  if (def.type === 'date') {
    if (isBlank(raw)) return { ok: true, value: '' };
    if (raw instanceof Date) {
      return Number.isNaN(raw.getTime()) ? { ok: false } : { ok: true, value: formatDate(raw) };
    }
    if (typeof raw === 'number') {
      // Excel 日期序列号：SSF 换算，兼容 1900/1904 日期系统，且不受时区影响
      const d = XLSX.SSF.parse_date_code(raw);
      return d ? { ok: true, value: `${d.y}-${pad2(d.m)}-${pad2(d.d)}` } : { ok: false };
    }
    const norm = normalizeDate(String(raw));
    return norm ? { ok: true, value: norm } : { ok: false };
  }
  if (def.type === 'select') {
    const s = isBlank(raw) ? '' : String(raw).trim();
    if (s === '') return { ok: true, value: '' };
    return (def.options ?? []).includes(s) ? { ok: true, value: s } : { ok: false };
  }
  if (raw instanceof Date) return { ok: true, value: formatDate(raw) };
  return { ok: true, value: String(raw ?? '') };
};

/**
 * 导入导出层。
 * @param sheetApi     网格读写通道
 * @param defs         列定义
 * @param fileInputRef 隐藏的文件 input（触发系统文件选择框）
 * @param afterImport  覆盖导入后的回调（重下发列 / 重算统计）
 */
export const useEntryIO = (
  sheetApi: EntrySheet,
  defs: Ref<ColDef[]>,
  fileInputRef: Ref<HTMLInputElement | undefined>,
  afterImport: () => void,
) => {
  const importExcel = () => fileInputRef.value?.click();

  /** 解析 Excel 并覆盖导入 */
  const onFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) {
        ElMessage.error('导入失败：文件里没有工作表');
        return;
      }
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
      const labelField = new Map<string, string>();
      defs.value.forEach((d) => labelField.set(d.label, d.field));

      const records: EntryRecord[] = [];
      const unmatched = new Set<string>();
      let skipped = 0;
      json.forEach((raw) => {
        const rec: EntryRecord = {};
        defs.value.forEach((d) => {
          rec[d.field] = d.type === 'number' ? null : '';
        });
        Object.keys(raw).forEach((cn) => {
          const field = labelField.get(cn);
          if (!field) {
            unmatched.add(cn);
            return;
          }
          const def = defs.value.find((d) => d.field === field);
          if (!def) return;
          const cell = normalizeImportValue(def, raw[cn]);
          if (!cell.ok) {
            skipped++;
            return;
          }
          rec[field] = fromCellValue(def, cell.value);
        });
        records.push(rec);
      });
      if (!records.length) {
        ElMessage.warning('没有解析到可导入的数据行');
        return;
      }
      await ElMessageBox.confirm(
        `将导入 ${records.length} 行，覆盖当前 ${sheetApi.dataRowCount()} 行数据（导入后可 Ctrl+Z 撤销）`,
        '导入确认',
        { confirmButtonText: '覆盖导入', cancelButtonText: '取消', type: 'warning' },
      );
      sheetApi.snapshot();
      sheetApi.writeRecords(records);
      afterImport();
      ElMessage.success(`已导入 ${records.length} 行`);
      if (skipped) ElMessage.warning(`${skipped} 个值不符合列类型（数字/日期/下拉），已跳过`);
      if (unmatched.size) {
        const names = [...unmatched];
        const more = names.length > 5 ? ` 等 ${names.length} 列` : '';
        ElMessage.warning(`未匹配到现有列、已忽略：${names.slice(0, 5).join('、')}${more}`);
      }
    } catch (err) {
      if (err === 'cancel' || err === 'close') return;
      ElMessage.error(`导入失败：${(err as Error).message}`);
    } finally {
      input.value = '';
    }
  };

  /** 取导出源数据：全部 = 真相源；当前结果 = 当前展示行（列头筛选后就是筛过的那些行） */
  const sourceRecords = (scope: 'all' | 'result'): EntryRecord[] =>
    scope === 'result' ? sheetApi.visibleRecords() : sheetApi.readRecords();

  /** 投影为"列标签 → 值"的对象数组（按列定义顺序，跳过隐藏列） */
  const toRowsForExport = (records: EntryRecord[]) =>
    records.map((rec) => {
      const out: Record<string, unknown> = {};
      defs.value.filter((d) => d.visible).forEach((d) => {
        out[d.label] = rec[d.field];
      });
      return out;
    });

  const exportExcel = (scope: 'all' | 'result') => {
    const records = sourceRecords(scope);
    if (!records.length) {
      ElMessage.warning('没有可导出的数据');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(toRowsForExport(records));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '录入数据');
    XLSX.writeFile(wb, scope === 'all' ? 'BI录入数据_全部.xlsx' : 'BI录入数据_当前结果.xlsx');
    ElMessage.success(`已导出 ${records.length} 行`);
  };

  const exportCsv = (scope: 'all' | 'result') => {
    const records = sourceRecords(scope);
    if (!records.length) {
      ElMessage.warning('没有可导出的数据');
      return;
    }
    const cols = defs.value.filter((d) => d.visible);
    const header = cols.map((d) => d.label).join(',');
    const body = records.map((rec) => cols.map((d) => `"${String(rec[d.field] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = `\uFEFF${[header, ...body].join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scope === 'all' ? 'BI录入数据_全部.csv' : 'BI录入数据_当前结果.csv';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success(`已导出 ${records.length} 行`);
  };

  const onExportCommand = (cmd: string) => {
    if (cmd === 'excelAll') exportExcel('all');
    else if (cmd === 'excelResult') exportExcel('result');
    else if (cmd === 'csv') exportCsv('result');
  };

  return { importExcel, onFileChange, onExportCommand };
};

export type EntryIO = ReturnType<typeof useEntryIO>;
