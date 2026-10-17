// 单元格校验：必填 / 邮箱格式 / 年龄区间；错误表 + 全量重校 + 错误清单
// 列定义与行数据的来源经 getter 注入，避免与 core 形成循环依赖
import { reactive, computed } from 'vue';
import type { ColDef, Row } from '../types';

export function useCellValidation(deps: {
  getColumnDefs: () => ColDef[];
  getRows: () => Row[];
  labelOf: (field: string) => string;
  firstVisibleField: () => string | undefined;
}) {
  const { getColumnDefs, getRows, labelOf, firstVisibleField } = deps;
  const cellErrors = reactive<Record<string, string>>({});
  const errKey = (rowId: string, field: string) => `${rowId}__${field}`;

  /** 校验单格：必填 / 邮箱格式 / 年龄区间；通过则清除该格错误标记 */
  const validateCell = (row: Row, field: string) => {
    const key = errKey(row.__id, field);
    const value = row[field];
    const def = getColumnDefs().find((d) => d.field === field);
    let msg = '';
    if (def?.required && (value === null || value === undefined || value === '')) {
      msg = `${def.label}必填`;
    } else if (field === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value))) {
      msg = '邮箱格式不正确';
    } else if (field === 'age' && value !== null && value !== '' && (Number(value) < 18 || Number(value) > 65)) {
      msg = '年龄需在 18-65';
    }
    if (msg) cellErrors[key] = msg;
    else delete cellErrors[key];
  };

  /** 全量重校：清空错误表后按当前列结构逐行逐格校验（列结构变更/撤销恢复后调用） */
  const revalidateAll = () => {
    for (const k of Object.keys(cellErrors)) delete cellErrors[k];
    for (const r of getRows()) for (const d of getColumnDefs()) validateCell(r, d.field);
  };

  // 单行全字段校验：新增/插入/复制行后立即标红必填缺失（与编辑态校验同一套规则）
  const validateRow = (row: Row) => {
    for (const d of getColumnDefs()) validateCell(row, d.field);
  };

  const errorCount = computed(() => Object.keys(cellErrors).length);
  const errorList = computed(() =>
    Object.entries(cellErrors).map(([k, msg]) => {
      const [rowId, field] = k.split('__');
      const row = getRows().find((r) => r.__id === rowId);
      return {
        rowId,
        field,
        msg,
        rowLabel: row ? String(row[firstVisibleField() ?? 'name'] ?? '') : '?',
        colLabel: labelOf(field),
      };
    }),
  );

  return { cellErrors, errKey, validateCell, validateRow, revalidateAll, errorCount, errorList };
}

export type CellValidation = ReturnType<typeof useCellValidation>;
