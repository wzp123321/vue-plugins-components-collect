// 录入台共享类型与基础常量
//
// 本文件职责：定义 Excel 式数据录入台的全部共享类型（列定义、行结构、撤销快照、
// 模板、校验规则）与基础常量（列类型文案、压测用字典、行 id 生成、空值默认值）。
//
// 在整体架构中的角色：是整个录入台的"数据契约层"。hooks（useGridCore / useGridColumns /
// useGridOps 等）、vxe 渲染器（components/cells）、各 UI 组件（列设置抽屉、规则弹窗、模板
// 弹窗等）都从这里 import 类型与常量，保证列结构、校验规则、行结构在整个应用里一致。
//
// 协作模块：
//   - useGridCore：基于 ColDef / Row / ColRule / CrossRule 做校验与统计；
//   - components/cells：根据 ColType 选择显示/编辑渲染器；
//   - useGridTemplates：把 ColDef[] 序列化为 Tpl 持久化到 localStorage；
//   - ColumnManagerDrawer / RuleDialog / AddColumnDialog：可视化编辑这些结构。

// 列类型枚举：决定单元格用哪个显示渲染器与哪个 element-plus 编辑渲染器。
export type ColType = 'text' | 'number' | 'select' | 'date';

/**
 * 单列校验规则（声明式）：加列、改列都能直接配规则，不必改校验代码。
 * 空值一律跳过（必填由 required 单独判定），避免"没填就报格式错"。
 *
 * 设计约定：这里只描述规则本身，不描述错误提示的渲染位置——校验失败时由
 * useGridCore 汇总到 cellErrors / errorList，主组件用 cellClassName 标红、ErrorDrawer 列清单。
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

/**
 * 单列定义（录入台列结构的原子单元）。
 *
 * ⚠️ 坑：width 只认 px（vxe 内部用 XEUtils.toInteger 解析，% 宽会被截断成整数百分比导致
 * 列宽异常）；fit prop 可能已被 vxe 废弃，不要用，列宽由 useGridColumns 按容器宽度等比换算。
 */
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

// 行结构：__id 是行唯一标识（vxe row-config.keyField 绑定它），__dirty 标记是否有改动。
// ⚠️ 坑：构造/复制新行时务必剥离 __id / __dirty，否则复制出来的行会与源行主键重复、
// 且错误地带着"已改动"标记；生成新行统一走 uid() 拿全新 __id，并把 __dirty 置为需要的初值。
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

// 列类型 → 中文文案，多处下拉/标签展示复用
export const typeLabel: Record<ColType, string> = { text: '文本', number: '数字', select: '下拉', date: '日期' };

// 压测/演示数据的字典常量（useGridDemoData 随机生成姓名/部门等时使用）
export const DEPARTMENTS = ['研发', '市场', '财务', '人事', '运营'];
export const STATUSES = ['在职', '试用期', '离职'];
export const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
export const GIVEN = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '霞', '平', '刚', '燕'];
export const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '苏州'];

// 单调递增序号，配合时间戳保证每行 id 全局唯一（同毫秒内多次生成也不会撞）
let seq = 0;
export const uid = () => `row_${Date.now().toString(36)}_${seq++}`;

// 列类型的空值默认值：一律留空（数字→null，其余→空串）。
// 新增行/插入行/模板应用/加列回填都只应有序号列有值，下拉不预选首项（预选会掩盖"未填写"）
export const emptyValueFor = (d: ColDef): any => (d.type === 'number' ? null : '');
