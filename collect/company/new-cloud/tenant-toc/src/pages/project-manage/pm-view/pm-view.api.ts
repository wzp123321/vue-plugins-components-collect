import {
  PM_IContractNodePeriod,
  PM_IContractPriceAdjust,
  PM_IContractShareModel,
  PM_IFeeNodeTypeVO,
} from '../pm-add-editor/pm-add-editor.api';

/**
 * 接口 [查询项目信息↗] **返回类型**
 */
export interface PM_IProjectViewDetail {
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
  region: string;
  // 能源类型
  energyPriceInfoList: PM_IProjectBasicEnergyVO[];
  // 托管周期
  trusteeshipDate: string;

  buildStartTime: string;
  buildEndTime: string;
  startTime: string;
  endTime: string;
  /**
   * 首托管期包含月数
   */
  firstBatch: number | null;
  /**
   * 建设期收入
   */
  buildingIncome: number | null;
  // 验收时间
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

// 收益分享模式
export interface PV_IConvertShareModel {
  grainSharingObject: number | null;
  grainSharingObjectName: string;
  grainSharingTypeList: {
    grainSharingType: number | null;
    grainSharingTypeName: string;
  }[];
}
