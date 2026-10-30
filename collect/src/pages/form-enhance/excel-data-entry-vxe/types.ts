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

/* ⚠️ 列类型 / 校验规则 / 空值判定 / 跨列规则这些「三套共用」的定义统一放在
   utils/bi-entry.ts：这里 import 进来再用，同时原样转发给上层，
   保证三套 schema 对外暴露的类型名和语义一致，改口径只改一处。 */
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
 *
 * 字段全部来自 `BiColLike`（三套录入台共用的最小列结构），这里只多做一件事：
 * 把 `visible` 提为必填 —— vxe 侧列的显隐是显式状态，不给默认值。
 *
 * ⚠️ 坑：width 只认 px（vxe 内部用 XEUtils.toInteger 解析，% 宽会被截断成整数百分比导致
 * 列宽异常）；fit prop 可能已被 vxe 废弃，不要用，列宽由 useGridColumns 按容器宽度等比换算。
 */
export interface ColDef extends BiColLike {
  visible: boolean;
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
// （emptyValueFor 已上提到 utils/bi-entry.ts，这里不再自造一份）
let seq = 0;
export const uid = () => `row_${Date.now().toString(36)}_${seq++}`;
