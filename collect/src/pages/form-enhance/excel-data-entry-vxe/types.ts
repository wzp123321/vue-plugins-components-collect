// 录入台共享类型与基础常量
export type ColType = 'text' | 'number' | 'select' | 'date';

/**
 * 单列校验规则（声明式）：加列、改列都能直接配规则，不必改校验代码。
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
  /** 值在整列内唯一（工号/邮箱等）；与空值无关，空值不参与 */
  unique?: boolean;
}

/** 跨列规则：只支持最常用的四种，够覆盖"结束日期≥开始日期"这类需求 */
export type CrossKind = 'gte' | 'lte' | 'eq' | 'requiredIf';

export interface CrossRule {
  kind: CrossKind;
  /** 参照列 field */
  other: string;
  msg?: string;
}

export interface ColDef {
  field: string;
  label: string;
  type: ColType;
  /** select 类型的可选项（同时用作列筛选器候选） */
  options?: string[];
  required?: boolean;
  /** 单列校验规则（见 ColRule） */
  rules?: ColRule;
  /** 跨列校验规则：本列与 other 列的大小/相等/条件必填关系 */
  cross?: CrossRule[];
  /** 是否可见（列设置抽屉切换，不可见的列不参与查询/复制/统计） */
  visible: boolean;
  /** 冻结在左侧（vxe fixed: 'left'） */
  frozen?: boolean;
  /** 基准宽（px）；实际显示宽由 useGridColumns 按容器宽度等比换算 */
  width?: number;
}

export type Row = { __id: string; __dirty: boolean; [key: string]: any };

// 撤销/重做快照：行数据 + 列结构
export interface Snap {
  rows: Row[];
  defs: ColDef[];
}

// 列结构模板（localStorage 持久化，仅存列结构不存数据）
export interface Tpl {
  name: string;
  defs: ColDef[];
  ts: number;
}

export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

let seq = 0;
export const uid = () => `row_${Date.now().toString(36)}_${seq++}`;

// 列类型的空值默认值：一律留空（数字→null，其余→空串）。
// 新增行/插入行/模板应用/加列回填都只应有序号列有值，下拉不预选首项（预选会掩盖"未填写"）
export const emptyValueFor = (d: ColDef): any => (d.type === 'number' ? null : '');
