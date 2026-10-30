/**
 * BI 数据录入 —— 列结构（运行时可编辑的 schema）
 *
 * 为什么要做「可编辑列结构」：vxe 录入台的核心不是「一张写死的表」，而是「用户自己定义字段」——
 * 加列、改类型、配校验、存成列模板。VTable 侧同样需要这层，否则就是一个固定 schema 的表单。
 *
 * 本文件只负责「列结构本身」：增删改、显隐、冻结、分组、列模板持久化、列宽分配。
 * 不负责渲染——VTable 的列定义在 vt-bi-entry.vue 里组装（那里才拿得到错误态 / 闪烁态）。
 *
 * ⚠️ 关键约束：列宽只认 px。等比分配在 allocWidths 里做，避免把 % 交给表格底层解析。
 */
import { computed, ref, type ComputedRef } from 'vue';
import { DEFAULT_COLS, makeCol, nextColField, type BiCol, type ColType } from './schema';

const TPL_KEY = 'vtable-bi-entry:col-tpl:v1';

/** 列模板：只存列结构，不存数据 */
export interface ColTemplate {
  name: string;
  cols: BiCol[];
  ts: number;
}

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
  const editableCols: ComputedRef<BiCol[]> = computed(() => cols.value.filter((c) => c.visible));
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

  /** 左右移动列（顺序影响表头分组与导出列序） */
  const moveCol = (field: string, dir: -1 | 1) => {
    const i = cols.value.findIndex((c) => c.field === field);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cols.value.length) {
      return;
    }
    const next = cols.value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    cols.value = next;
  };

  const resetCols = () => {
    cols.value = JSON.parse(JSON.stringify(DEFAULT_COLS)) as BiCol[];
  };

  const replaceCols = (next: BiCol[]) => {
    cols.value = next.map((c) => ({ ...c }));
  };

  // ============================ 列模板（localStorage） ============================
  const templates = ref<ColTemplate[]>([]);

  const loadTemplates = () => {
    const raw = localStorage.getItem(TPL_KEY);
    if (!raw) {
      templates.value = [];
      return;
    }
    try {
      const arr = JSON.parse(raw) as ColTemplate[];
      templates.value = Array.isArray(arr) ? arr.filter((t) => t && t.name && Array.isArray(t.cols)) : [];
    } catch {
      templates.value = [];
    }
  };

  const persistTemplates = () => {
    localStorage.setItem(TPL_KEY, JSON.stringify(templates.value));
  };

  const saveTemplate = (name: string) => {
    const key = name.trim();
    if (!key) {
      return false;
    }
    const tpl: ColTemplate = { name: key, cols: JSON.parse(JSON.stringify(cols.value)) as BiCol[], ts: Date.now() };
    const at = templates.value.findIndex((t) => t.name === key);
    templates.value = at >= 0 ? templates.value.map((t, i) => (i === at ? tpl : t)) : [...templates.value, tpl];
    persistTemplates();
    return true;
  };

  const removeTemplate = (name: string) => {
    templates.value = templates.value.filter((t) => t.name !== name);
    persistTemplates();
  };

  const loadTemplate = (name: string): boolean => {
    const tpl = templates.value.find((t) => t.name === name);
    if (!tpl) {
      return false;
    }
    replaceCols(tpl.cols);
    return true;
  };

  return {
    cols,
    visibleCols,
    numberCols,
    editableCols,
    labelOf,
    colOf,
    addCol,
    removeCol,
    updateCol,
    moveCol,
    resetCols,
    replaceCols,
    templates,
    loadTemplates,
    saveTemplate,
    removeTemplate,
    loadTemplate,
  };
};

export type BiColumnsApi = ReturnType<typeof useBiColumns>;
