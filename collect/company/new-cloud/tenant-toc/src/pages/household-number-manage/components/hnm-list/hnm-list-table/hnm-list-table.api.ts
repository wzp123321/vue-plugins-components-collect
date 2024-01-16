export interface ISearchForm extends GeneralModule.CommonQueryParams {
  accountNumber: string;
  energyCode: string;
}

export interface EnergyCodeVO {
  code: string;
  name: string;
  unit: string;
}

/**
 * 表格分页查询接口入参
 * @param accountNumber 模糊查询-户号
 * @param energyCode 能源类型编码
 * @param tenantCode 租户编码
 * @param tenantId 租户id
 */
interface ordersType {
  asc: boolean;
  column: string;
}

export interface queryHouseholdNumberList {
  accountNumber: string;
  energyCode?: string;
  orders: ordersType[];
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
  tenantCode: string;
  tenantId: number;
}
/**
 * 表格分页查询接口返回 list
 * @param accountNumber 户号
 * @param energyCode 能源编码
 * @param energyName 能源名称
 * @param hostingAreaId 托管区域id
 * @param hostingAreaName 	托管区域名称
 * @param treeId 关联节点id
 * @param treeName 关联节点名称
 * @param hostingFlag 是否平托
 */
export interface householdNumberListVO {
  accountNumber: string;
  energyCode: string;
  energyName: string;
  hostingAreaId: number;
  hostingAreaName: string;
  id: number;
  treeId: number;
  treeName: string;
  hostingFlag: string
}

/**
 * 新增户号接口入参
 * @param accountNumber 户号
 * @param energyCode 能源类型编码
 * @param hostingAreaId 托管院区id
 * @param tenantCode 租户编码
 * @param tenantId 租户id
 * @param treeId 树id
 */
export interface addHouseholdNumber {
  accountNumber: string;
  energyCode: string | undefined;
  hostingAreaId: number | null;
  tenantCode: string;
  tenantId: number;
  treeId: number | undefined;
}

/**
 * 编辑户号接口入参
 * @param accountNumber 户号
 * @param energyCode 能源类型编码
 * @param hostingAreaId 托管院区id
 * @param treeId 树id
 */
export interface updateHouseholdNumber {
  accountNumber: string;
  energyCode: string | undefined;
  hostingAreaId: number | undefined;
  id: number;
  treeId: number | undefined;
  tenantCode: string;
  tenantId: number;
}

/**
 * 关联节点返回参数
 */
export interface treeListVO {
  treeId: number;
  parentId: number;
  treeName: string;
  treeType: string;
  childTree: any[];
}

/**
 * 删除户号接口入参
 */
export interface downloadParams {
  tenantCode: string;
  tenantId: number;
}
/**
 * 根据分类分项查询户号
 */
export interface queryAccountNumberByEnergyCodeParams {
  energyCode: string;
  tenantCode: string;
  tenantId: number;
}

/**
 * 导入异常返回数据
 */
export interface errorDataListType {
  detail: string;
  position: string;
}

/**
 * 所属托管范围 & 分类分项list
 */
export interface type {
  code: string;
  name: string;
  unit?: string;
}

export enum EPath {
  获取表格数据 = '/tenantAccount/queryTenantAccountPage',
  查询分类分项 = '/baseHead/queryEnergyType',
  删除 = '/tenantAccount/delete',
}
