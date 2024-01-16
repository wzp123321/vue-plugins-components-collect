import { PFE_IIndexVO } from '@/pages/project-manage/pm-formula-editor/pm-formula-editor.api';

/**
 * 条件组
 */
export interface PFV_IConditionGroup {
  startPeriod: string;
  endPeriod: string;
  conditionList: PFV_ICondition[];
}
/**
 * 条件
 */
export interface PFV_ICondition {
  // 判断条件-二维数组，兼容后续条件支持多个的情况
  judgementConditions: PFE_IIndexVO[];
  // 计算公式，兼容后续条件支持多个的情况
  computationalFormulas: PFE_IIndexVO[];
}
