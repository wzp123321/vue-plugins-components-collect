// Tabulator BI 数据录入台 —— 列元信息与示例数据（数据契约层）
// ============================================================================
// 本文件职责：
//   1. 定义录入台唯一的列模型 ColDef（类型/必填/校验规则/跨列规则/下拉选项/列宽/可见性）；
//   2. 提供示例数据生成器与值归一化工具（写入前/读取后统一口径）。
//
// 在整体架构中的角色：对应 vxe 版 types.ts、Univer 版 schema.ts。
//   Tabulator 是 DOM 表格、行即对象（每行 = 一条 EntryRecord），没有"表头行偏移/网格坐标"
//   那一套——所以这里不再需要 HEADER_ROW / toSheetRow / 字号 pt 换算，列结构本身即真相源。
//
// 与另两套一致：列类型 / 校验规则 / 空值判定 / 跨列规则这些"三套共用"的定义统一放在
// utils/bi-entry.ts，这里 import 进来再用，同时原样转发给上层，改口径只改一处。
// ============================================================================

import {
  DEFAULT_DATE_FORMAT,
  cloneRows,
  crossError,
  emptyValueFor,
  formatDate,
  isBlank,
  isMetaField,
  isRealDate,
  normalizeDate,
  numOf,
  pad2,
  renderDate,
  round2,
  rowIsEmpty,
  rowSignature,
  tsName,
  type BiColLike,
  type ColRule,
  type ColType,
  type CrossKind,
  type CrossRule,
} from '@/utils/bi-entry';

export type { ColRule, ColType, CrossKind, CrossRule };
export {
  DEFAULT_DATE_FORMAT,
  cloneRows,
  crossError,
  emptyValueFor,
  formatDate,
  isBlank,
  isMetaField,
  isRealDate,
  normalizeDate,
  numOf,
  pad2,
  renderDate,
  round2,
  rowIsEmpty,
  rowSignature,
  tsName,
};

/**
 * 单列定义（录入台列结构的原子单元）。
 * 继承 BiColLike：三套录入台的列模型共享同一套字段名与语义，
 * 共用函数（跨列规则 / 空值 / 日期归一）才能直接吃进来。
 */
export interface ColDef extends BiColLike {
  /** 基准列宽（px） */
  width: number;
  /** 是否在网格中可见（隐藏列保留数据，只是不渲染） */
  visible: boolean;
}

/** 一条录入记录：字段 → 值。字段名与 ColDef.field 一一对应。
 *  `rowId` 是行元信息（META_FIELDS 之一），不参与校验/导出/统计：
 *  Tabulator 用 `index: 'rowId'` 定位行，错误/查找高亮也以它为键——
 *  这样开排序/筛选后行号变了，高亮仍然跟着原来那条数据走。 */
export type EntryRecord = Record<string, unknown>;

/** 行身份自增序号（进程内唯一即可，不需要全局唯一） */
let rowSeq = 0;

/** 生成一个行身份 */
export const newRowId = (): string => {
  rowSeq += 1;
  return `r${rowSeq}`;
};

/** 补齐缺失的行身份：已有 rowId 的记录原样返回（保持对象引用，别破坏与 Tabulator 的共享） */
export const ensureRowIds = (records: EntryRecord[]): EntryRecord[] =>
  records.map((r) => (typeof r.rowId === 'string' && r.rowId !== '' ? r : { ...r, rowId: newRowId() }));

/** 列类型中文标签（共用） */
export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

/** 压测/示例数据字典（与另两套保持一致，便于横向对比性能） */
export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

/** 日期列存储口径：一律 YYYY-MM-DD（显示与校验都以此为准） */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 按列结构造一条空记录（带行身份） */
export const makeEmptyRecord = (defs: ColDef[]): EntryRecord => {
  const rec: EntryRecord = { rowId: newRowId() };
  defs.forEach((d) => {
    rec[d.field] = emptyValueFor(d);
  });
  return rec;
};

/** 默认列结构（员工主数据，覆盖四种列类型 + 必填 + 唯一 + 正则 + 跨列规则） */
export const DEFAULT_COLS: ColDef[] = [
  { field: 'name', label: '姓名', type: 'text', required: true, width: 120, visible: true, rules: { minLen: 2, maxLen: 12 } },
  { field: 'age', label: '年龄', type: 'number', required: true, width: 90, visible: true, rules: { min: 18, max: 65 } },
  { field: 'department', label: '部门', type: 'select', options: DEPARTMENTS, required: true, width: 110, visible: true },
  {
    field: 'joinDate',
    label: '入职日期',
    type: 'date',
    required: true,
    width: 130,
    visible: true,
    cross: [{ kind: 'lte', other: 'leaveDate', msg: '入职日期不能晚于离职日期' }],
  },
  { field: 'leaveDate', label: '离职日期', type: 'date', width: 130, visible: true },
  {
    field: 'email',
    label: '邮箱',
    type: 'text',
    width: 200,
    visible: true,
    rules: { unique: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', patternMsg: '邮箱格式不正确' },
  },
  { field: 'status', label: '状态', type: 'select', options: STATUSES, required: true, width: 100, visible: true },
  { field: 'remark', label: '备注', type: 'text', width: 160, visible: true },
];

/**
 * 生成 n 条真实感示例记录。
 * 离职员工才填离职日期，给"入职 ≤ 离职"这条跨列规则提供真实数据面。
 */
export const genSampleRecords = (n: number, defs: ColDef[] = DEFAULT_COLS): EntryRecord[] => {
  const list: EntryRecord[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const name = SURNAMES[i % SURNAMES.length] + GIVEN[(i * 3) % GIVEN.length];
    const age = 22 + (i % 40);
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const year = 2018 + (i % 8);
    const month = 1 + (i % 12);
    const day = 1 + ((i * 5) % 27);
    const joinDate = `${year}-${pad2(month)}-${pad2(day)}`;
    const status = STATUSES[i % STATUSES.length];
    const leaveDate = status === '离职' ? `${year + 2}-${pad2(month)}-${pad2(day)}` : '';
    const raw: EntryRecord = {
      name,
      age,
      department,
      joinDate,
      leaveDate,
      email: `emp${String(i + 1).padStart(5, '0')}@corp.example.com`,
      status,
      remark: CITIES[i % CITIES.length],
    };
    const rec = makeEmptyRecord(defs);
    defs.forEach((d) => {
      rec[d.field] = d.field in raw ? raw[d.field] : emptyValueFor(d);
    });
    list[i] = rec;
  }
  return list;
};

/** 写入前出参归一化：数字转 number（空→null），其余转字符串 */
export const toCellValue = (d: ColDef, v: unknown): string | number | null => {
  if (d.type === 'number') {
    if (isBlank(v)) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return isBlank(v) ? '' : String(v);
};

/** 读取后入参归一化：数字列空值回落 null，其余回落空串 */
export const fromCellValue = (d: ColDef, v: unknown): unknown => {
  if (d.type === 'number') {
    if (isBlank(v)) return null;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }
  return isBlank(v) ? '' : String(v);
};
