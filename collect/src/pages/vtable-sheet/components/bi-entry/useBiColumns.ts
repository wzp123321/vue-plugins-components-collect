/**
 * BI 数据录入 —— 列结构（运行时可编辑的 schema）
 *
 * 为什么要做「可编辑列结构」：录入台的核心不是「一张写死的表」，而是「用户自己定义字段」——
 * 加列、改类型、配校验（共享抽屉 BiColumnDrawer）。VTable 侧同样需要这层，否则就是一个
 * 固定 schema 的表单。列模板、复制列、移动列已随列设置列表一起移除（对齐 Univer）。
 *
 * 本文件只负责「列结构本身」：增删改、显隐、冻结、分组、列宽分配。
 * 不负责渲染——VTable 的列定义在 vt-bi-entry.vue 里组装（那里才拿得到错误态 / 闪烁态）。
 *
 * ⚠️ 关键约束：列宽只认 px。等比分配在 allocWidths 里做，避免把 % 交给表格底层解析。
 */
import { computed, ref, type ComputedRef } from 'vue';
import { DEFAULT_COLS, makeCol, nextColField, type BiCol, type ColType } from './schema';

/** 行号列 + 勾选列固定占位宽 */
export const ROWNO_WIDTH = 52;
export const SELECT_WIDTH = 46;

/**
 * 按容器宽度等比分配列宽。
 * 基宽取自 schema（用户拖拽后会回写），总宽不足时按最小宽兜底，剩余给最后一列。
 */
export const allocWidths = (cols: readonly BiCol[], totalWidth: number): number[] => {
  const base = cols.map((c) => c.width || 100);
  const sum = base.reduce((a, b) => a + b, 0);
  const avail = Math.max(totalWidth - ROWNO_WIDTH - SELECT_WIDTH, cols.length * 60);
  if (!sum) {
    return base;
  }
  const scaled = base.map((w) => Math.max(56, Math.round((w / sum) * avail)));
  const used = scaled.reduce((a, b) => a + b, 0);
  const last = scaled.length - 1;
  if (last >= 0) {
    scaled[last] += avail - used;
  }
  return scaled;
};

/** 连续同 group 的列聚成父表头（组内仅 1 列则不分组） */
export interface ColGroupNode {
  title: string;
  fields: string[];
}

export const groupColumns = (cols: readonly BiCol[]): ColGroupNode[] => {
  const nodes: ColGroupNode[] = [];
  cols.forEach((c) => {
    const title = c.group?.trim();
    const last = nodes[nodes.length - 1];
    if (title && last && last.title === title) {
      last.fields.push(c.field);
      return;
    }
    nodes.push({ title: title || '', fields: [c.field] });
  });
  // 单列的伪分组退化成普通列
  return nodes.map((n) => (n.fields.length > 1 ? n : { ...n, title: '' }));
};

export const useBiColumns = () => {
  const cols = ref<BiCol[]>(JSON.parse(JSON.stringify(DEFAULT_COLS)) as BiCol[]);

  const visibleCols: ComputedRef<BiCol[]> = computed(() => cols.value.filter((c) => c.visible));
  const numberCols: ComputedRef<BiCol[]> = computed(() => cols.value.filter((c) => c.type === 'number'));
  const labelOf = (field: string): string => cols.value.find((c) => c.field === field)?.label ?? field;
  const colOf = (field: string): BiCol | undefined => cols.value.find((c) => c.field === field);

  const addCol = (type: ColType, label?: string): BiCol => {
    const field = nextColField(cols.value);
    const col = makeCol(type, field, label?.trim() || `新列${cols.value.length + 1}`);
    cols.value = [...cols.value, col];
    return col;
  };

  const removeCol = (field: string) => {
    cols.value = cols.value.filter((c) => c.field !== field);
  };

  const updateCol = (field: string, patch: Partial<BiCol>) => {
    cols.value = cols.value.map((c) => (c.field === field ? { ...c, ...patch } : c));
  };

  return {
    cols,
    visibleCols,
    numberCols,
    labelOf,
    colOf,
    addCol,
    removeCol,
    updateCol,
  };
};

export type BiColumnsApi = ReturnType<typeof useBiColumns>;
