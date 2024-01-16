// 跳转链接
export enum DPC_EJumpUrl {
  树模型管理 = '/treeManage',
  科室分摊分摊规则 = '/adShareRules',
  指标数据维护 = '/indicatorDataMaintenance',
  维护考核目标值 = '/web/departmentAssessmentTarget',
}
// 跳转指标数据维护存储数据key
export const DPC_JUMP_INDICATOR__KEY = 'ems-departmentFlag';
// 限制tag展示数量的最小宽度
export const DPC_MIN_COLLAPSE_TAGS_WIDTH = 320;
// 指标
export interface DPC_IIndexVO {
  id: number;
  name: string;
  unit: string;
}
// 页面配置相关信息
export interface DPC_IPageForm {
  /**
   * 已勾选指标 List
   */
  indexIdList: number[];
  /**
   * 勾选科室树
   */
  treeIdList: number[];
  /**
   * 勾选的分类分项List
   */
  energyCodeList: string[];
  /**
   * 是否完成配置（0否，1是）
   */
  configFlag: boolean;
  /**
   * 是否展开（0折叠，1展开）
   */
  showFlag: boolean;
}
