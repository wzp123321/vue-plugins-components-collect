import { Common_ICodeName } from '@/services/common/common-api';
import { DPC_IIndexVO } from './da-params-configure/da-params-configure.api';

// 科室考核请求接口地址
export enum DA_EPath {
  查询页面相关配置信息 = '/apportionCheck/getCheckInfo',
  考核指标下拉框 = '/apportionCheck/getCheckIndexList',
  查询科室树 = '/admin/apportionTree/queryApportionTree',
  查询已勾选的科室树 = '/apportionCheck/querySelectedTree',

  保存用户操作记录 = '/apportionCheck/saveUserOperation',
  考核指标保存 = '/apportionCheck/saveCheckIndexList',
  勾选分类分项保存 = '/apportionCheck/saveEnergyCodeInfo',
  考核科室保存 = '/apportionCheck/saveApportionTreeInfo',

  查询科室考核排行榜 = '/apportionCheck/queryRankList',
  查询科室考核明细 = '/apportionCheck/queryApportionDetailList',
  导出科室考核明细 = '/apportionCheck/downloadApportionDetailList',
}
// 操作状态
export interface DA_IOperationState {
  /**
   * 是否完成配置
   */
  configFlag: boolean;
  /**
   * 是否展开
   */
  showFlag: boolean;
}
// 配置的数据
export interface DA_IConfigureData {
  /**
   * 已勾选指标 List
   */
  indexIdList: DPC_IIndexVO[];
  /**
   * 勾选科室树
   */
  treeIdList: number[];
  /**
   * 分类分项List
   */
  allEnergyCodeList: Common_ICodeName<string>[];
  /**
   * 勾选的分类分项List
   */
  energyCodeList: Common_ICodeName<string>[];
}

// 页面配置相关信息
export type DA_ICheckInfo = DA_IConfigureData & DA_IOperationState;
