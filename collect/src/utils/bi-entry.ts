/**
 * BI 数据录入 —— 三套录入台（vxe / VTable / Univer）共用的纯函数
 *
 * 背景：三套实现各自复制了一份「空值判定 / 数值转换 / 日期归一 / 行签名 / 跨列规则」。
 * 同一条口径要在三个目录里改三遍，极易漂移——「数字列空值到底是 null 还是空串」
 * 这类差异就是这么产生的。这里集中定义一次，三套只引用、不再自造。
 *
 * 与本目录其它文件的分工：这里只放**录入台业务语义**的纯函数，
 * 通用日期 / 数值格式化仍走 `utils/date.ts` / `utils/number.ts`。
 *
 * ⚠️ 约定（与三套 schema 一致，改这里等于改三套）：
 *   - 行元信息 rowId / selected / changed / rowNo 不参与校验、导出、统计；
 *   - 日期列**存储恒为 YYYY-MM-DD**，格式串只影响展示；
 *   - 数字列的空值是 null，其余列是空串。
 */

/** 列类型：决定单元格显示与编辑器。只做四类，三套对齐 */
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

/** 列定义的最小结构：三套各自的列类型都是它的超集，可直接传入 */
export interface BiColLike {
  field: string;
  label: string;
  type: ColType;
  options?: string[];
  required?: boolean;
  rules?: ColRule;
  cross?: CrossRule[];
  visible?: boolean;
  frozen?: boolean;
  width?: number;
  dateFormat?: string;
  group?: string;
}

/** 行数据：元信息 + 任意业务字段 */
export type BiRowLike = Record<string, unknown>;

/** 行元信息字段：不参与校验 / 导出 / 查询 / 统计 */
export const META_FIELDS = ['rowId', 'selected', 'changed', 'rowNo'] as const;

export const isMetaField = (field: string): boolean =>
  (META_FIELDS as readonly string[]).includes(field);

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Date → YYYY-MM-DD（取本地年月日：xlsx 的 cellDates 用本地时区构造 Date） */
export const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** 年月日是否真实存在（挡掉 2026-02-30 这类） */
const isRealYmd = (y: number, mo: number, d: number): boolean => {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) {
    return false;
  }
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
};

/** 严格校验：YYYY-MM-DD 且真实存在 */
export const isRealDate = (s: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? ''));
  if (!m) {
    return false;
  }
  return isRealYmd(Number(m[1]), Number(m[2]), Number(m[3]));
};

/**
 * 宽松日期归一化：接受 2024-01-05 / 2024/1/5 / 2024年1月5日，统一为 YYYY-MM-DD。
 * 含闰年与月份天数校验，无法解析返回 null（由调用方跳过并提示）。
 */
export const normalizeDate = (raw: string): string | null => {
  const m = /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/.exec(raw);
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return isRealYmd(y, mo, d) ? `${y}-${pad2(mo)}-${pad2(d)}` : null;
};

/** 按格式串渲染日期（只替换 YYYY / MM / DD 令牌，非规范值原样返回） */
export const renderDate = (value: unknown, fmt?: string): string => {
  const s = String(value ?? '');
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    return s;
  }
  return (fmt || DEFAULT_DATE_FORMAT).replace(/YYYY/g, m[1]).replace(/MM/g, m[2]).replace(/DD/g, m[3]);
};

export const round2 = (n: number): number => Number(n.toFixed(2));

/** 时间戳名（导出文件名用）：YYYYMMDD_HHMMSS */
export const tsName = (): string => {
  const d = new Date();
  const p = (v: number): string => String(v).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

/** 取有效数值：空值与不可转数的值返回 null */
export const numOf = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') {
    return null;
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/** 空值判定：null / undefined / 空串都算「没填」 */
export const isBlank = (v: unknown): boolean => v === null || v === undefined || v === '';

/** 按列类型给空值：数字 → null，其余 → 空串 */
export const emptyValueFor = (col: { type: ColType }): unknown => (col.type === 'number' ? null : '');

/** 行拷贝（值都是标量，浅拷贝一层即够） */
export const cloneRows = <T extends BiRowLike>(rows: readonly T[]): T[] => rows.map((r) => ({ ...r }));

/** 行的业务字段签名（去重 / 判空用；不含元信息）。分隔符用 \u0001 避开常见输入字符 */
export const rowSignature = (cols: readonly { field: string }[], row: BiRowLike): string =>
  cols.map((c) => String(row[c.field] ?? '')).join('\u0001');

/** 整行业务列是否全空 */
export const rowIsEmpty = (cols: readonly { field: string }[], row: BiRowLike): boolean =>
  cols.every((c) => isBlank(row[c.field]));

/**
 * 跨列规则判定：返回错误消息，空串表示通过。
 *
 * ⚠️ 空值一律跳过——空值的合法性由 required 负责，否则「两列都没填」也会弹错，
 * 用户会以为系统坏了。三种比较里数字优先按数值比，其余按字符串比
 * （YYYY-MM-DD 定长格式可直接比较，不必先转 Date）。
 */
export const crossError = (
  record: BiRowLike,
  def: { type: ColType; label: string; cross?: CrossRule[] },
  value: unknown,
  labelOf: (field: string) => string,
): string => {
  const rules = def.cross ?? [];
  for (let i = 0; i < rules.length; i += 1) {
    const c = rules[i];
    const otherVal = record[c.other];
    const otherLabel = labelOf(c.other);
    if (c.kind === 'requiredIf') {
      if (!isBlank(otherVal) && isBlank(value)) {
        return c.msg || `${def.label}为必填（${otherLabel}已填）`;
      }
    } else if (!isBlank(value) && !isBlank(otherVal)) {
      if (c.kind === 'eq') {
        if (String(value) !== String(otherVal)) {
          return c.msg || `${def.label}需与${otherLabel}一致`;
        }
      } else {
        const a = Number(value);
        const b = Number(otherVal);
        const numeric = !Number.isNaN(a) && !Number.isNaN(b)
          && String(value).trim() !== '' && String(otherVal).trim() !== '';
        const cmp = numeric ? a - b : String(value).localeCompare(String(otherVal));
        if (c.kind === 'gte' && cmp < 0) {
          return c.msg || `${def.label}不能早于/小于${otherLabel}`;
        }
        if (c.kind === 'lte' && cmp > 0) {
          return c.msg || `${def.label}不能晚于/大于${otherLabel}`;
        }
      }
    }
  }
  return '';
};
