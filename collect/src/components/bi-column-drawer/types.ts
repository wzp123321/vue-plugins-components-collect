// 列配置抽屉（三套录入台共用）—— 类型契约
// ============================================================================
// 为什么要有这个共享层：
//   三套录入台（vxe / VTable / Univer）的「点列头配这一列」此前各写了一份 UI：
//   vxe 是 440px 右侧抽屉 + 草稿确定，VTable 是 640px 居中弹窗 + 保存，
//   Univer 干脆打开全量列列表再滚动定位。同一个动作三种观感、三种提交语义。
//   本目录提供唯一一份抽屉，三套只做「列定义 ⇄ 草稿」的映射。
//
// 契约：
//   - 入参列定义直接用 utils/bi-entry.ts 的 BiColLike（已是三套列模型的公共超集）；
//   - 出参是一份已裁剪（空规则不落盘）的草稿，各引擎整体回写即可；
//   - 引擎能力差异（冻结 / 表头分组 / 列宽）由 caps 控制显隐，
//     不做「按钮在、点了没反应」的假统一。
import type { BiColLike, ColRule, ColType, CrossRule } from '@/utils/bi-entry';

/** 引擎能力开关：决定抽屉里哪些配置项出现 */
export interface ColumnCaps {
  /** 支持冻结列 */
  frozen?: boolean;
  /** 支持多级表头（表头分组） */
  group?: boolean;
  /** 支持手填列宽（px 直生效；按容器等比换算的引擎不要开） */
  width?: boolean;
}

/** 抽屉确认后交给各引擎回写的草稿（空值已裁掉） */
export interface ColumnDraft extends BiColLike {
  label: string;
  type: ColType;
  required: boolean;
  visible: boolean;
  options?: string[];
  rules?: ColRule;
  cross?: CrossRule[];
}

/** 抽屉内部草稿：options / rules / cross 定为必填形态，省去逐处判空 */
export interface DraftState extends ColumnDraft {
  options: string[];
  rules: ColRule;
  cross: CrossRule[];
}
