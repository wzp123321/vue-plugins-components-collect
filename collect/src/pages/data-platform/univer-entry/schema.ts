// Univer BI 数据录入台 —— 列元信息与示例数据（数据契约层）
// ============================================================================
// 本文件职责：
//   1. 定义录入台唯一的列模型 ColDef（类型/必填/校验规则/跨列规则/下拉选项/列宽/可见性）；
//   2. 定义"表头行 + 数据行"到 Univer 网格行号的换算常量与工具；
//   3. 提供示例数据生成器与值归一化工具（写入前/读取后统一口径）。
//
// 在整体架构中的角色：对应 vxe 版 excel-data-entry-vxe/types.ts。
//   Univer 自身持有单元格数据（画布表格是唯一真相源），本文件只描述"每列是什么"，
//   校验、条件格式、数据验证、导入导出、列设置抽屉全部依赖这里的模型。
//
// 与 vxe 版的差异：
//   - vxe 行对象带 __id / __dirty，靠行对象追踪脏标记；
//     Univer 没有行对象，脏标记改为"与基线快照逐格比对"，故这里不再有 Row 类型。
//   - 列顺序 == 网格列顺序（A、B、C…），列增删移位会整体重写表头与数据。
// ============================================================================

/** 列类型：决定数据验证形态与输入约束 */
export type ColType = 'text' | 'number' | 'select' | 'date';

/**
 * 单列声明式校验规则。
 * 空值一律跳过（必填由 required 单独判定），避免"没填就报格式错"。
 */
export interface ColRule {
  /** 数字最小值（含） */
  min?: number;
  /** 数字最大值（含） */
  max?: number;
  /** 文本最小长度 */
  minLen?: number;
  /** 文本最大长度 */
  maxLen?: number;
  /** 正则源（不带斜杠），配合 patternMsg 给出可读提示 */
  pattern?: string;
  patternMsg?: string;
  /** 值在整列内唯一（工号/邮箱等）；空值不参与 */
  unique?: boolean;
}

/** 跨列规则：只保留最常用的四种，覆盖"结束日期 ≥ 开始日期"这类需求 */
export type CrossKind = 'gte' | 'lte' | 'eq' | 'requiredIf';

export interface CrossRule {
  kind: CrossKind;
  /** 参照列 field */
  other: string;
  msg?: string;
}

/** 单列定义（录入台列结构的原子单元） */
export interface ColDef {
  field: string;
  label: string;
  type: ColType;
  /** select 类型的可选项 */
  options?: string[];
  required?: boolean;
  rules?: ColRule;
  cross?: CrossRule[];
  /** 基准列宽（px） */
  width: number;
  /** 是否在网格中可见（隐藏列保留数据，只 hideColumn） */
  visible: boolean;
}

/** 一条录入记录：字段 → 值。字段名与 ColDef.field 一一对应 */
export type EntryRecord = Record<string, unknown>;

/** 表头所在网格行（0-based），数据从下一行开始 */
export const HEADER_ROW = 0;
/** 数据行下标（0-based）→ 网格行号 */
export const toSheetRow = (dataIndex: number): number => dataIndex + HEADER_ROW + 1;
/** 网格行号 → 数据行下标（表头行返回 -1） */
export const toDataIndex = (sheetRow: number): number => sheetRow - HEADER_ROW - 1;

export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

/** 网格最大行数（建表时一次性给足，避免边录边扩行触发重排） */
export const SHEET_ROW_COUNT = 20000;
/** 网格最大列数 */
export const SHEET_COLUMN_COUNT = 60;

/**
 * 网格密度：与另两套录入台对齐（vxe 行高 36 / 字号 12.5，VTable 行高 36 / 字号 12）。
 * Univer 默认 20px 行高 + 11pt 字号偏挤，三页并排时密度差最扎眼。
 */
export const ENTRY_ROW_HEIGHT = 32;
/** 单元格字号（Univer 的 fs 按 pt 数值直接渲染，12 ≈ 12px） */
export const ENTRY_FONT_SIZE = 12;

// 压测/示例数据字典（与 vxe 版保持一致，便于横向对比两种实现的性能表现）
export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

/** 日期列存储口径：一律 YYYY-MM-DD（显示与校验都以此为准） */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * 宽松日期归一化：接受 2024-01-05 / 2024/1/5 / 2024年1月5日，统一为 YYYY-MM-DD。
 * 含闰年与月份天数校验，无法解析返回 null（由调用方跳过并提示）。
 */
export const normalizeDate = (raw: string): string | null => {
  const m = raw.match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${pad2(mo)}-${pad2(d)}`;
};

/** 列类型的空值：数字留 null，其余留空串（下拉不预选首项，避免掩盖"未填写"） */
export const emptyValueFor = (d: ColDef): unknown => (d.type === 'number' ? null : '');

/** 按列结构造一条空记录 */
export const makeEmptyRecord = (defs: ColDef[]): EntryRecord => {
  const rec: EntryRecord = {};
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

/** 空值判定：null / undefined / 空串都算"没填" */
export const isBlank = (v: unknown): boolean => v === null || v === undefined || v === '';

/** 写入网格前的出参归一化：数字转 number（空→空串），其余转字符串 */
export const toCellValue = (d: ColDef, v: unknown): string | number => {
  if (d.type === 'number') {
    if (isBlank(v)) return '';
    const n = Number(v);
    return Number.isNaN(n) ? '' : n;
  }
  return isBlank(v) ? '' : String(v);
};

/** 从网格读回后的入参归一化：数字列空值回落 null，其余回落空串 */
export const fromCellValue = (d: ColDef, v: unknown): unknown => {
  if (d.type === 'number') {
    if (isBlank(v)) return null;
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }
  return isBlank(v) ? '' : String(v);
};
