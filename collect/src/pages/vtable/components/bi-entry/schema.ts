/**
 * BI 数据录入 —— 数据契约层（类型 / 默认列 / 校验规则 / 字典 / 工具）
 *
 * 场景：@visactor/vtable 上的「常见 BI 数据录入」，能力面对齐站内 vxe 录入台
 * （pages/form-enhance/excel-data-entry-vxe），但走 VTable 原生能力，不重写 Excel 仿真层。
 *
 * 本文件的定位：整个录入台的唯一数据契约。列结构是**运行时可编辑的 schema**（加列/改列/列模板），
 * 因此不能像普通页面那样把列写死成 interface 字段 —— 行数据用「元信息 + 任意业务字段」表示。
 *
 * 协作模块：
 *   - useBiColumns：列结构增删改、显隐/冻结/分组、列模板、VTable 列构建；
 *   - useBiValidation：按本文件的 ColRule / CrossRule 做声明式校验；
 *   - useBiQuery / useBiHistory / useBiActions / useBiIO：查询、撤销、行操作、导入导出。
 *
 * ⚠️ 约定：rowId / selected / changed / rowNo 是行元信息，永远不参与校验与导出的业务列。
 */

/** 列类型：决定单元格显示与编辑器。只做四类，与 vxe / Univer 两套对齐 */
export type ColType = 'text' | 'number' | 'select' | 'date';

/** 单列校验规则（声明式）。空值一律跳过，必填由 required 单独判定 */
export interface ColRule {
  /** 数字下限（含） */
  min?: number;
  /** 数字上限（含） */
  max?: number;
  /** 必须为整数 */
  integer?: boolean;
  /** 文本最小长度 */
  minLen?: number;
  /** 文本最大长度 */
  maxLen?: number;
  /** 正则源（不带斜杠），配合 patternMsg 给可读提示 */
  pattern?: string;
  patternMsg?: string;
  /** 值在整列内唯一（工号 / 邮箱等）；空值不参与 */
  unique?: boolean;
}

/** 跨列规则：只做最常用的四种，覆盖「结束日期 ≥ 开始日期」这类需求 */
export type CrossKind = 'gte' | 'lte' | 'eq' | 'requiredIf';

export interface CrossRule {
  kind: CrossKind;
  /** 参照列 field */
  other: string;
  msg?: string;
}

/** 单列定义（列结构原子单元） */
export interface BiCol {
  field: string;
  label: string;
  type: ColType;
  /** select 的可选项（同时作为筛选项来源） */
  options?: string[];
  required?: boolean;
  rules?: ColRule;
  cross?: CrossRule[];
  /** 是否可见（列设置抽屉切换；不可见列不参与查询/复制/统计） */
  visible: boolean;
  /** 冻结在左侧（VTable frozenColCount 换算时使用） */
  frozen?: boolean;
  /** 基准宽（px），实际宽按容器等比分配 */
  width: number;
  /** 日期列显示格式，默认 YYYY-MM-DD（存储恒为 YYYY-MM-DD） */
  dateFormat?: string;
  /** 表头分组名：同名且连续的列汇聚到一个父表头 */
  group?: string;
}

/**
 * 行数据：元信息 + 任意业务字段。
 * 继承 Record<string, unknown> 是为了让运行时可编辑的 schema 能按 field 动态读写，
 * 同时保留 rowId/selected/changed/rowNo 的强类型。
 */
export interface BiRow extends Record<string, unknown> {
  rowId: string;
  selected: boolean;
  changed: boolean;
  /** 行号（结构变更时重排；与 vxe 的序号列语义一致） */
  rowNo: number;
}

/** 行元信息字段：不参与校验 / 导出 / 查询 */
export const META_FIELDS = ['rowId', 'selected', 'changed', 'rowNo'] as const;
export const isMetaField = (field: string) => (META_FIELDS as readonly string[]).includes(field);

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

/** 列类型中文文案 */
export const typeLabel: Record<ColType, string> = {
  text: '文本',
  number: '数字',
  select: '下拉',
  date: '日期',
};

// ============================ 字典（演示数据与下拉候选） ============================
export const REGIONS = ['华东', '华南', '华北', '西南', '东北'];
export const CATEGORIES = ['食品', '饮料', '日用', '数码', '服饰'];
export const OWNERS = ['张伟', '李芳', '王敏', '刘洋', '陈磊'];

// ============================ 默认列结构 ============================
/** 默认 schema：8 个业务列，覆盖文本 / 数字 / 下拉 / 日期 / 勾选五种类型与多种校验形态 */
export const DEFAULT_COLS: BiCol[] = [
  {
    field: 'region',
    label: '区域',
    type: 'select',
    options: REGIONS,
    required: true,
    visible: true,
    frozen: true,
    width: 84,
    group: '基础信息',
  },
  {
    field: 'category',
    label: '品类',
    type: 'select',
    options: CATEGORIES,
    required: true,
    visible: true,
    frozen: true,
    width: 84,
    group: '基础信息',
  },
  {
    field: 'product',
    label: '产品名称',
    type: 'text',
    required: true,
    rules: { minLen: 2, maxLen: 24 },
    visible: true,
    width: 140,
    group: '基础信息',
  },
  {
    field: 'owner',
    label: '负责人',
    type: 'select',
    options: OWNERS,
    rules: { unique: true },
    visible: true,
    width: 84,
    group: '基础信息',
  },
  {
    field: 'sales',
    label: '销售额(元)',
    type: 'number',
    required: true,
    rules: { min: 0, max: 100000000 },
    // 跨列校验：销售额不得低于本行目标额（同一行内两列比较）
    cross: [{ kind: 'gte', other: 'target', msg: '不能低于目标额' }],
    visible: true,
    width: 110,
  },
  {
    field: 'target',
    label: '目标额(元)',
    type: 'number',
    rules: { min: 0 },
    visible: true,
    width: 110,
  },
  {
    field: 'quantity',
    label: '销量(件)',
    type: 'number',
    required: true,
    rules: { min: 0, integer: true },
    visible: true,
    width: 96,
  },
  {
    field: 'rate',
    label: '完成率(%)',
    type: 'number',
    required: true,
    rules: { min: 0, max: 100 },
    visible: true,
    width: 96,
  },
  {
    field: 'date',
    label: '统计日期',
    type: 'date',
    required: true,
    visible: true,
    width: 116,
  },
];

/** 新列默认宽度：数字 104 / 日期 116 / 其余 120 */
const defaultWidthOf = (type: ColType): number => {
  if (type === 'number') {
    return 104;
  }
  return type === 'date' ? 116 : 120;
};

/** 新增列的默认模板（按类型给合理默认） */
export const makeCol = (type: ColType, field: string, label: string): BiCol => ({
  field,
  label,
  type,
  options: type === 'select' ? ['选项A', '选项B'] : undefined,
  required: false,
  visible: true,
  width: defaultWidthOf(type),
  dateFormat: type === 'date' ? DEFAULT_DATE_FORMAT : undefined,
});

// ============================ 工具 ============================
export const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatDate = (d: Date): string => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** 严格日期校验：YYYY-MM-DD 且真实存在（挡掉 2026-02-30） */
export const isRealDate = (s: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    return false;
  }
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return dt.getFullYear() === Number(m[1]) && dt.getMonth() === Number(m[2]) - 1 && dt.getDate() === Number(m[3]);
};

/** 按格式串渲染日期（只替换 YYYY/MM/DD 令牌，非规范值原样返回） */
export const renderDate = (value: unknown, fmt?: string): string => {
  const s = String(value ?? '');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    return s;
  }
  return (fmt || DEFAULT_DATE_FORMAT).replace(/YYYY/g, m[1]).replace(/MM/g, m[2]).replace(/DD/g, m[3]);
};

export const round2 = (n: number) => Number(n.toFixed(2));

export const numOf = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') {
    return null;
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export const isBlank = (v: unknown) => v === null || v === undefined || v === '';

/** 时间戳名（导出文件名用） */
export const tsName = () => {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
};

let seq = 0;
/** 行 id：时间戳 + 自增，保证同毫秒内也唯一 */
export const nextRowId = () => {
  seq += 1;
  return `r${seq}_${Date.now().toString(36)}`;
};

/** 新列字段名：c1 / c2 …，避开已有字段 */
export const nextColField = (cols: readonly BiCol[]): string => {
  const used = new Set(cols.map((c) => c.field));
  let i = cols.length + 1;
  while (used.has(`c${i}`)) {
    i += 1;
  }
  return `c${i}`;
};

/** 按列类型给空值：数字 → null，其余 → 空串 */
export const emptyValueFor = (col: BiCol): unknown => (col.type === 'number' ? null : '');

/** 空行：只填元信息与各列空值 */
export const makeEmptyRow = (cols: readonly BiCol[], rowNo = 0): BiRow => {
  const row = { rowId: nextRowId(), selected: false, changed: false, rowNo } as BiRow;
  cols.forEach((c) => {
    row[c.field] = emptyValueFor(c);
  });
  return row;
};

/** 归一化导入行：补齐缺失列、剥掉脏值 */
export const normalizeRow = (cols: readonly BiCol[], raw: Record<string, unknown>): BiRow => {
  const row = makeEmptyRow(cols);
  cols.forEach((c) => {
    const v = raw[c.field];
    if (v === undefined) {
      return;
    }
    if (c.type === 'number') {
      row[c.field] = numOf(v);
    } else {
      row[c.field] = v === null || v === undefined ? '' : String(v);
    }
  });
  if (typeof raw.rowId === 'string') {
    row.rowId = raw.rowId;
  }
  return row;
};

/** 深拷贝行（浅拷贝行即够：值都是标量） */
export const cloneRows = (rows: readonly BiRow[]): BiRow[] => rows.map((r) => ({ ...r }));

/** 每行的业务字段签名（去重 / 判空用；不含元信息） */
export const rowSignature = (cols: readonly BiCol[], row: BiRow): string =>
  cols.map((c) => String(row[c.field] ?? '')).join('\u0001');

/** 整行业务列是否全空 */
export const rowIsEmpty = (cols: readonly BiCol[], row: BiRow): boolean =>
  cols.every((c) => isBlank(row[c.field]));

/** 下拉选项稳定配色：按选项下标取色，保证同一选项颜色恒定。
 *  Canvas 只能给「整格」上底色（vxe 版是格内小标签），所以亮度必须压到很低——
 *  整格铺 14% 饱和色在深色底上会变成马赛克块，压到 9%~12% 才是一层"色带"。
 *  深色主题另配一档：同色相、更低透明度 + 亮字，避免暗底上发灰。 */
export const TAG_PALETTE = [
  { bg: 'rgba(43,92,246,.06)', fg: '#2450d8', bgDark: 'rgba(43,92,246,.09)', fgDark: '#9db4ff' },
  { bg: 'rgba(0,180,42,.06)', fg: '#00891f', bgDark: 'rgba(0,180,42,.09)', fgDark: '#79dd94' },
  { bg: 'rgba(255,143,31,.07)', fg: '#b96a00', bgDark: 'rgba(255,143,31,.1)', fgDark: '#ffc078' },
  { bg: 'rgba(245,63,63,.06)', fg: '#cf2b2b', bgDark: 'rgba(245,63,63,.09)', fgDark: '#ff9d9d' },
  { bg: 'rgba(124,77,255,.06)', fg: '#6031d9', bgDark: 'rgba(124,77,255,.1)', fgDark: '#c0a7ff' },
  { bg: 'rgba(0,174,197,.07)', fg: '#007f8c', bgDark: 'rgba(0,174,197,.1)', fgDark: '#6fd6e0' },
  { bg: 'rgba(232,67,147,.06)', fg: '#c22a76', bgDark: 'rgba(232,67,147,.09)', fgDark: '#ff9ec4' },
  { bg: 'rgba(120,144,156,.07)', fg: '#4d5c66', bgDark: 'rgba(120,144,156,.1)', fgDark: '#a9b6c0' },
];

export const tagColor = (idx: number, dark = false) => {
  const n = TAG_PALETTE.length;
  const c = TAG_PALETTE[((idx % n) + n) % n];
  return dark ? { bg: c.bgDark, fg: c.fgDark } : { bg: c.bg, fg: c.fg };
};
