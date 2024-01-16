import { CommonICodeName } from '../../../service/api/index';
import { PM_EProjectIncomeType, PM_EProjectPeriodType } from '../constant/enum';
import {
  PM_IContractNodePeriod,
  PM_IContractPriceAdjust,
  PM_IContractShareModel,
  PM_IFeeNodeTypeVO,
} from '../pm-add-editor/pm-add-editor.api';

export enum PmEPageUrl {
  查看页面 = '/home/projectManage/view',
  编辑页面 = '/home/projectManage/editor',
  项目级大屏 = '/cloud-portal/terminal',
  项目级查看页面 = '/projectManage/view',
  项目级编辑页面 = '/projectManage/editor',
}

/**
 * 表单
 * @param name 项目名
 * @param status 状态
 * @param page 页码
 * @param pageSize 每页条数
 */
export interface SearchForm extends GeneralModule.CommonQueryParams {
  projectName: string;
  status?: string;
  pageNum: number;
  pageSize: number;
}
/**
 * 表格 项目详情
 * @param benchmarkType: number; 基准类型
 * @param projectName: string; 医院名称
 * @param city: 市
 * @param district: 区县
 * @param region: 大区
 * @param code： 租户编码
 * @param endTime: 托管结束时间
 * @param gainSharing: 收益分享
 * @param hostingType: 托管类型
 * @param id: number; ID
 * @param name: 名称
 * @param province: 省
 * @param startTime: 托管开始时间
 * @param riskRating: 风险评级
 * @param status: number;
 */
export interface ProjectVO {
  benchmarkType: string;
  projectName: string;
  city: string;
  district: string;
  region: string | null;
  code: string;
  endTime: string;
  gainSharing: string;
  hostingType: string;
  id: number;
  name: string;
  hostingStartTime: string;
  hostingEndTime: string;
  province: string;
  riskRating: string;
  startTime: string;
  status: string;
}

/**
 * @param operationalPeriod 运营期
 * @param trusteeshipDate 托管周期
 * @param energyManager 能源经理
 * @param energyCode 托管能源类型
 * @param hasPartnerShare 是否有合作伙伴分成
 * @param energyPriceList 合同单价
 * @param increaseRate 增长率
 * @param trusteeshipAreas 托管区域
 * @param energyProjects 节能项目
 */
export interface ProjectDetail extends ProjectVO {
  operationalPeriod: Date[];
  trusteeshipDate: Date[];
  // 首托管期包含月数
  firstBatch: string;
  // 建设期收入
  buildingIncome: string;
  energyManager: string;
  energyCode: string[];
  hasPartnerShare: string;
  energyPriceList: EnergyCodePrice[];
  trusteeshipType: string;
  increaseRate: string;

  trusteeshipAreas: TrusteeshipArea[];
  depositAreas: DepositArea[];
  energyProjects: EnergyProject[];
  acceptanceTime: string;
  projectNumber: string[];
  bindingHospitalId: string;
  bindingAreaIds: string[];
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

// 查询详情入参
export interface SearchDetailParams {
  tenantCode: string;
  tenantId: number;
}
// 查询的详情
export interface SearchDetailVO {
  contractInfoVO: ContractInfoVO;
  hostingDetailVO: HostingDetailVO;
  projectBasicInfoVO: ProjectBasicInfoVO;
  tenantCode: string;
  tenantId: number;
}
// 托管信息
export interface HostingDetailVO {
  energyConservationList: SearchEnergyProject[];
  hostingAreaInfoList: TrusteeshipArea[];
}
// 项目详情
export interface ProjectBasicInfoVO {
  city: string;
  district: string;
  projectName?: string;
  region: string | null;
  endTime: string;
  // 首托管期包含月数
  firstBatch: string;
  // 建设期收入
  buildingIncome: string;
  energyManager: string;
  energyPriceInfoList: EnergyCodePrice[];
  province: string;
  startTime: string;
  hostingStartTime: string;
  hostingEndTime: string;
  status: string;
  acceptanceTime: string;
  projectNumber: string[];
  bindingHospitalId: string;
  bindingAreaIds: string[];
}
// 合同信息
export interface ContractInfoVO {
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
  nodePeriod: {
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
    periodStr: string;
  }[];
  /**
   * 核算涉及费用格式
   */
  feeNodeType: PM_IFeeNodeTypeVO[];
}
// 能源类型 单价
export interface EnergyCodePrice {
  energyCode: string;
  energyName: string;
  price: string;
  unit: string;
}
// 托管区域
export interface TrusteeshipArea {
  name: string;
  energyCode: string;
  isSubregion: boolean;
  price: {
    id: number | null;
    areaName: string;
    priceType: string;
    value: string;
  }[];
}

export interface DepositArea {
  name: string;
  energyCode: string;
  isSubregion: boolean;
  price: {
    id: number | null;
    areaName: string;
    priceType: string;
    value: string;
  }[];
}
// 节能项目
export interface EnergyProject {
  checked: boolean;
  projectCode: string;
  projectName: string;
  energyCode: string;
  treeType: string;
  treeList: ProjectTreeInfo[];
  treeId: number[];
  expandedKeys: number[];
  loading: boolean;

  energyAreaList: CommonICodeName<string>[];
  regionId: string;
  regionName: string;
}
// 接口返回项目
export interface SearchEnergyProject {
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
   * 树节点id
   */
  treeId: number | null;
  /**
   * 树节点类型
   */
  treeType: string;
  /**
   * 托管区域id
   */
  regionId: string | null;
  /**
   * 托管区域名称
   */
  regionName: string;
}
// 省市
export interface IKeyValue {
  code: string;
  name: string;
}
// 能源类型
export interface EnergyCode extends IKeyValue {
  unit: string;
  createTime: string;
  id: number;
  updateTime: string;
}
// 查询树参数
export interface SearchTreeParams {
  energyCode?: string;
  expandLevel: number;
  parentId?: number;
  tenantCode: string;
  tenantId: number;
  treeType: string;
}
// 树
export interface ProjectTreeInfo {
  parentId: number;
  treeId: number;
  treeName: string;
  treeType: string;
  childTree: ProjectTreeInfo[];
}
// 查询树响应结果
export interface TreeRes {
  expandTreeIds: number[];
  data: ProjectTreeInfo[];
}

/**
 * 查询托管区域
 */
export interface PM_IQueryEnergyAreaParams extends SearchDetailParams {
  energyCode: string;
}
