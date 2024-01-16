/**
 * 接口 [查询项目信息↗] **返回类型**
 */
export interface PM_IProjectDetail {
  tenantId: number | null;
  tenantCode: string;
  projectBasicInfoVO: PM_IProjectBasicDetail;
  contractInfoVO: PM_IContractDetail;
  hostingDetailVO: PM_IHostingDetail;
}

// 基础信息
export interface PM_IProjectBasicDetail {
  // 项目名称
  projectName: string;
  // 状态
  status: string;
  // 省
  province: string;
  // 市
  city: string;
  // 县区
  district: string;
  // 能源经理
  energyManager: string;
  region: string | null;
  // 能源类型
  energyPriceInfoList: PM_IProjectBasicEnergyVO[];
  hostingStartTime: string;
  hostingEndTime: string;
  buildStartTime?: string;
  buildEndTime?: string;
  startTime: string;
  endTime: string;
  /**
   * 首托管期包含月数
   */
  firstBatch: string;
  /**
   * 建设期收入
   */
  buildingIncome: string;
  acceptanceTime: string;
  // 项目编码
  projectNumber: string[];
  bindingHospitalId: string;
  bindingAreaIds: number[];
}
// 基础信息-能源类型
export interface PM_IProjectBasicEnergyVO {
  energyName: string;
  energyCode: string;
}
// 合同信息
export interface PM_IContractDetail {
  hostingType: string;
  riskRating: string;
  benchmarkType: string;
  growthRate: string;
  /**
   * 收益分享模式
   */
  shareModel: PM_IContractShareModel[];
  /**
   * 单价调整
   */
  priceAdjustmentType: PM_IContractPriceAdjust[];
  /**
   * 项目收入计算
   */
  nodePeriod: PM_IContractNodePeriod[];
  /**
   * 核算涉及费用格式
   */
  feeNodeType: PM_IFeeNodeTypeVO[];
}
// 合同信息-收益分享
export interface PM_IContractShareModel {
  /**
   * 分享模式 0 保证伙伴收益型 1节能收益天溯分享型
   */
  incomeShareModel: number | null;
  /**
   * 分享对象: 0、国网/资方 1、院方 2、天溯
   */
  incomeShareObject: number | null;
  /**
   * 分享类型：0、固定收益 1、收益分享 2、其他收益
   */
  incomeShareType: number | null;
  /**
   * 备注
   */
  remark: string;
}
// 合同信息-单价调差方式
export interface PM_IContractPriceAdjust {
  /**
   * 能源类型
   */
  energyCode: string;
  /**
   * 单价调差方式
   */
  adjustType: number | null;
  /**
   * 浮动下限
   */
  lower: string;
  /**
   * 浮动上限
   */
  upper: string;
  /**
   * 调整时间类型
   */
  adjustTimeType: number | null;
  /**
   * 单价类型
   */
  priceType: number | null;
  /**
   * 自定义单价
   */
  customPrice: string;
  /**
   * 单价精度
   */
  decimalPoint: string;
  /**
   * 调整基数类型
   */
  adjustCardinalityType: number | null;
}
// 合同信息-项目收入计算
export interface PM_IContractNodePeriod {
  /**
   * 节点id
   */
  nodeId: string;
  /**
   * 1预算、 2核算
   */
  nodeDivision: number | null;
  /**
   * 1全周期、  2自定义托管期
   */
  periodType: number | null;
  /**
   * 配置的托管期
   */
  periodStr: number[];
}
// 合同信息-核算涉及费用
export interface PM_IFeeNodeTypeVO {
  /**
   * 核算涉及费用格式
   */
  feeType: number;
  /**
   * 院方缴费能源类型
   */
  energyCodes: string;
}

// 托管信息
export interface PM_IHostingDetail {
  // 托管区域信息
  hostingAreaInfoList: PM_IHostingAreaInfo[];
  // 节能项目信息
  energyConservationList: PM_IHostingEnergyConservationInfo[];
}
// 托管信息-托管区域信息
export interface PM_IHostingAreaInfo {
  /**
   * 能源类型编码
   */
  energyCode: string;
  /**
   * 能源类型名称
   */
  name: string;
  /**
   * 是否分托管区域
   */
  isSubregion: boolean;
  /**
   * 托管区域名称
   */
  price: PM_IHostingPriceInfo[];
}
// 托管信息-区域-单价信息
export interface PM_IHostingPriceInfo {
  /**
   * 托管区域id
   */
  id: number | null;
  /**
   * 托管区域名称
   */
  areaName: string;
  /**
   * 单价类型
   */
  priceType: string;
  /**
   * 单价
   */
  value: number | null;
}
// 托管信息-节能项目信息
export interface PM_IHostingEnergyConservationInfo {
  /**
   * 项目编码
   */
  projectCode: string;
  /**
   * 项目名称
   */
  projectName: string;
  /**
   * 能源编码
   */
  energyCode: string;
  /**
   * 能源名称
   */
  energyName: string;
  /**
   * 树节点id
   */
  treeId: number | null;
  /**
   * 树节点名称
   */
  treeName: string;
  /**
   * 树节点类型
   */
  treeType: string;
  /**
   * 托管区域id
   */
  regionId: number | null;
  /**
   * 托管区域名称
   */
  regionName: string;
}
