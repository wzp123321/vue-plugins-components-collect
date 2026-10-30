/**
 * BI 数据录入 —— 导入 / 导出
 *
 * 复用站内 src/utils/excel.ts 同款依赖（ExcelJS），不用 xlsx（有已知 CVE）。
 * 导入按**表头文案**映射到列（列可改名，所以不能按下标），类型按列定义归一化；
 * 未识别的表头直接忽略，缺列留空，保证「改过列结构的老文件」也能导进来。
 *
 * 导出三档与 vxe 录入台一致：全部 Excel / 当前结果 Excel / 当前结果 CSV（带 BOM 防中文乱码）。
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ComputedRef, ShallowRef } from 'vue';
import { numOf, renderDate, tsName, type BiCol, type BiRow } from './schema';
import type { BiHistoryApi } from './useBiHistory';
import type { BiValidationApi } from './useBiValidation';

export interface IODeps {
  rows: ShallowRef<BiRow[]>;
  activeCols: ComputedRef<BiCol[]>;
  history: BiHistoryApi;
  validation: BiValidationApi;
  afterStructure: (label: string) => void;
}

/** 单元格值 → 导出字符串 */
const cellToStr = (col: BiCol, row: BiRow): string | number => {
  const v = row[col.field];
  if (col.type === 'date') {
    return renderDate(v, col.dateFormat);
  }
  if (col.type === 'number') {
    const n = numOf(v);
    return n === null ? '' : n;
  }
  return v === null || v === undefined ? '' : String(v);
};

/** 按列类型给空值 */
const emptiesOf = (col: BiCol): unknown => (col.type === 'number' ? null : '');

/** 导入值 → 列类型（日期兼容 Date 对象与多种字符串） */
const normalizeImportValue = (col: BiCol, raw: unknown): unknown => {
  if (raw === null || raw === undefined) {
    return emptiesOf(col);
  }
  if (col.type === 'number') {
    if (raw instanceof Date) {
      return null;
    }
    return numOf(raw);
  }
  if (col.type === 'date') {
    if (raw instanceof Date) {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const d = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(raw).trim();
    const hit = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
    if (hit) {
      return `${hit[1]}-${hit[2].padStart(2, '0')}-${hit[3].padStart(2, '0')}`;
    }
    return s;
  }
  if (raw instanceof Date) {
    return renderDate(
      `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`,
    );
  }
  return String(raw);
};

export const useBiIO = (deps: IODeps) => {
  const { rows, activeCols, history, validation } = deps;

  // ============================ 导出 ============================
  const buildWorksheet = (wb: ExcelJS.Workbook, list: readonly BiRow[]) => {
    const ws = wb.addWorksheet('BI 数据');
    ws.columns = activeCols.value.map((c) => ({
      header: c.label,
      key: c.field,
      width: Math.max(10, Math.round(c.width / 7)),
    }));
    list.forEach((row) => {
      const obj: Record<string, string | number> = {};
      activeCols.value.forEach((c) => {
        obj[c.field] = cellToStr(c, row);
      });
      ws.addRow(obj);
    });
    // 表头加粗 + 冻结首行
    const header = ws.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: 'middle' };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    return ws;
  };

  const exportRows = async (list: readonly BiRow[], scopeLabel: string) => {
    const wb = new ExcelJS.Workbook();
    buildWorksheet(wb, list);
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `BI数据_${scopeLabel}_${tsName()}.xlsx`);
  };

  const exportCsv = (list: readonly BiRow[], scopeLabel: string) => {
    const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const lines: string[] = [activeCols.value.map((c) => esc(c.label)).join(',')];
    list.forEach((row) => {
      lines.push(activeCols.value.map((c) => esc(String(cellToStr(c, row)))).join(','));
    });
    // BOM：Excel 打开中文不乱码
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `BI数据_${scopeLabel}_${tsName()}.csv`);
  };

  // ============================ 导入 ============================
  const parseWorkbook = async (file: File): Promise<BiRow[]> => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    if (!ws) {
      return [];
    }
    // 表头映射：label → col（允许用户改过列名后表头对不上，此时按 field 兜底）
    const byLabel = new Map<string, BiCol>();
    const byField = new Map<string, BiCol>();
    activeCols.value.forEach((c) => {
      byLabel.set(c.label.trim(), c);
      byField.set(c.field, c);
    });
    const headerRow = ws.getRow(1);
    const mapping: Array<{ index: number; col: BiCol }> = [];
    headerRow.eachCell((cell, colNumber) => {
      const text = String(cell.value ?? '').trim();
      const col = byLabel.get(text) ?? byField.get(text);
      if (col) {
        mapping.push({ index: colNumber, col });
      }
    });
    if (!mapping.length) {
      return [];
    }
    const out: BiRow[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const next = { rowId: `imp_${rowNumber}_${Date.now().toString(36)}`, selected: false, changed: false, rowNo: out.length + 1 } as BiRow;
      activeCols.value.forEach((c) => {
        next[c.field] = emptiesOf(c);
      });
      mapping.forEach(({ index, col }) => {
        next[col.field] = normalizeImportValue(col, row.getCell(index).value);
      });
      out.push(next);
    });
    return out;
  };

  /** 导入：mode=replace 覆盖当前数据，append 追加到末尾 */
  const importExcel = async (file: File, mode: 'replace' | 'append' = 'replace') => {
    const parsed = await parseWorkbook(file);
    if (!parsed.length) {
      return { ok: false as const, reason: '未识别到表头，请确认首行是列名', count: 0 };
    }
    const before = history.snapshot(`导入 Excel（${mode === 'replace' ? '覆盖' : '追加'}）`);
    rows.value = mode === 'replace' ? parsed : [...rows.value, ...parsed];
    rows.value.forEach((r, i) => {
      r.rowNo = i + 1;
    });
    history.pushSnapshot(before);
    validation.scanAll(rows.value);
    deps.afterStructure('导入完成');
    return { ok: true as const, reason: '', count: parsed.length };
  };

  return {
    exportRows,
    exportCsv,
    importExcel,
    cellToStr,
  };
};

export type BiIOApi = ReturnType<typeof useBiIO>;
