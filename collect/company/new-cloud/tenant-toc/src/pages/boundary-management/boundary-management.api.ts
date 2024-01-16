import { Common_ITenantVO } from '@/service/api';

/**
 * 接口地址
 */
export enum EBmPath {
  新增边界管理 = '/boundaryManagement/addManagement',
  编辑边界管理 = '/boundaryManagement/editManagement',
  边界数据编辑 = '/boundaryManagement/editData',
  边界单价编辑 = '/boundaryManagement/editPrice',
  '页面查询-除边界规则之外的数据' = '/boundaryManagement/queryByCondition',
  查询边界规则 = '/boundaryManagement/queryRule',
  删除边界管理 = '/boundaryManagement/delManagement',
  查询能源类型和托管区域 = '/boundaryManagement/queryEnergyArea',
  查询边界类型 = '/boundaryManagement/queryType',
  根据边界id获取详情 = '/boundaryManagement/queryBoundaryManagementById',
}
/**
 * 计量类型
 */
export enum BM_EMeasureType {
  挂表 = '1',
  预估 = '2',
}
/**
 * 核定类型
 */
export enum BM_EVerificationType {
  已核定 = '1',
  未核定 = '2',
}
/**
 * 事件类型
 */
export enum BM_EPersistentType {
  持续性 = '1',
  间断性 = '2',
}
/**
 * 新增边界管理
 */
export interface BM_IAddManagementParams extends Common_ITenantVO {
  /**
   * 托管期
   */
  hostingPeriod: number | null;
  /**
   * 边界类型（1新增用能区域 2业务量 3气候异常）
   */
  boundaryType: string;
  /**
   * 事件名称
   */
  eventName: string;
  /**
   * 设备类型 1医疗设备、生活热水相关设备、其他全年运行的设备 2单制冷空调设备 3单制热空调设备
   */
  deviceType: string;
  /**
   * 核定状态（1已核定 2未核定）
   */
  verificationType: string;
  /**
   * 计量类型（1挂表计量 2预估）
   */
  measureType: string;
  /**
   * 能源类型
   */
  energyCodeAreas: BM_IEnergyAreaVO[];
  /**
   * 备注
   */
  comment: string;
}

/**
 * 编辑边界管理入参
 */
export interface BM_IEditManagementParams extends BM_IAddManagementParams {
  /**
   * 事件名称
   */
  eventId: number | null;
  chainId: number | null;
}
/**
 * 新增、编辑-能源类型
 */
export interface BM_IEnergyAreaVO {
  /**
   * 能源类型
   */
  energyCode: string;
  /**
   * 能源类型对应的区域id集合
   */
  hostingAreaIds: number[];
}
/**
 * 边界数据编辑(编辑单元格数据)
 */
export interface BM_IEditDataParams extends Common_ITenantVO {
  /**
   * 第n托管期
   */
  hostingPeriod: number | null;
  /**
   * 事件id
   */
  eventId: number | null;
  /**
   * 能源类型
   */
  energyCode: string;
  /**
   * 托管区域id
   */
  hostingAreaId: number | null;
  /**
   * 年
   */
  year: number;
  /**
   * 月
   */
  month: number;
  /**
   * 能耗量
   */
  amount: number | null;
  /**
   * 边界类型（1新增用能区域 2新增设备 3气候异常 4业务量）
   */
  boundaryType: number | null;
  /**
   * 核定状态（1已核定 2未核定）
   */
  verificationType: string;
  /**
   * 计量类型（1挂表计量 2预估）
   */
  measureType: string;
  /**
   * 事件类型（1持续性 2间断性）
   */
  persistentType: string;
}
/**
 * 事件单价编辑入参
 */
export interface BM_IEditPriceParams extends Omit<BM_IEditDataParams, 'amount'> {
  price: number | null;
}
/**
 * 页面查询入参-除边界规则之外的数据
 */
export interface BM_IQueryByConditionReqParams extends Common_ITenantVO {
  /**
   * 第n托管期
   */
  hostingPeriod: number;
  /**
   * 核定状态（1已核定 2未核定）
   */
  verificationType: string;
  /**
   * 计量类型（1挂表计量 2预估）
   */
  measureType: string;
}
/**
 * 页面查询-除边界规则之外的数据-响应结果
 */
export interface BM_IQueryByConditionResponse {
  pageVO: BM_IQueryByConditionPageVO;
}
/**
 * 页面查询-除边界规则之外的数据-响应结果
 */
export interface BM_IQueryByConditionPageVO {
  [key: number]: BM_IQueryByConditionTypeVO;
}
/**
 * 边界类型数据
 */
export interface BM_IQueryByConditionTypeVO {
  boundaryTypeName: string;
  persistentType: string;
  tableVO: BM_IEventTableListVO[];
}
/**
 * 事件列表
 */
export interface BM_IEventTableListVO {
  chainId: number;
  eventId: number | null;
  eventName: string;
  editableMonths: number[];
  deviceType: string;
  titleList: string[];
  dataList: BM_IEventDataVO[];
}
/**
 * 事件中的数据列表
 */
export interface BM_IEventDataVO {
  energyCode: string;
  energyName: string;
  energyUnit: string;
  hostingAreaId: number;
  hostingAreaName: string;
  itemName: string;
  dataList: number[];
  editFlag: boolean;
  lineTotal: number;
  summaryFlag: boolean;
  commentFlag: boolean;
  comment: string;
}
/**
 * 查询能源类型和托管区域-响应结果
 */
export type BM_IQueryEnergyAreaResponse = {
  energyCode: BM_IEnergyResponse;
  hasHostingRegion: boolean;
  hostingAreas: BM_IHostingAreaVO[];
};
/**
 * 边界中勾选的能源类型信息
 */
export interface BM_IEnergyResponse {
  name: string;
  code: string;
  unit: string;
  coalRatio: number;
  coalUnit: string;
  co2Ratio: number;
  co2Unit: string;
  id: number;
  createTime: string;
  updateTime: string;
}
/**
 * 边界中勾选的区域信息
 */
export interface BM_IHostingAreaVO {
  tenantId: number;
  energyCode: string;
  regionName: string;
  priceType: string;
  id: number;
  createTime: string;
  updateTime: string;
}
