/** 头部搜索参数通用 */
export interface SearchParmas {
  energyCode: any[];
  queryTimeList: Array<any>;
  timeUnit?: number;
  treeIds: number[];
  valueMean: string;
}
/** 通用对象 */
export interface CommonObject {
  [key: string]: any;
}
/**
 * 菜单
 */
export interface MenuInfo {
  id: number;
  name: string;
  orderNum: number;
  remark: string;
  type: number;
  url: string;
  childMenu: MenuInfo[];
}
/**
 * 菜单响应结果
 */
export interface MenuRes {
  menuList: MenuInfo[];
  defaultUrl: string;
  menuListAll: MenuInfo[];
  frontMenuListAll: MenuInfo[];
}

/** 接口返参 start */
export interface ResTemplate<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}
/** 列表接口响应 */
export interface HttpListResponsive<T> {
  list: T;
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}
export interface HttpBlobRequestResponsive<T> {
  data: T;
  message: string;
  body: string;
  type: string;
}

export interface CheckTokenRes {
  user?: {
    userId: number;
    name: string;
    loginName: string;
    tenantId: number;
    deptId: number;
    picUrl: string;
  };
  tenant?: {
    tenantId: number;
    tenantLogo: string;
    tenantName: string;
    platformName: string;
    tenantCode: string;
    loginUrl: string;
    multiCampus: boolean;
    businessType: number;
  };
  usable?: {
    item: string;
    values: { id: number; code: string; name: string }[];
  }[];
  used?: { item: string; code: string }[];
}

export interface KeepAliveParams {
  tenantCode: number;
  token: string;
}

/**
 * 查询顶部告警信息参数
 */
export interface IQueryAlarmParams {
  tenantId: string;
  userId: string;
}

/**
 * 顶部告警信息
 */
export interface IHeaderAlarmVO {
  critical: number;
  major: number;
  minor: number;
  recover: number;
  total: number;
  warn: number;
}

/**
 * 登出参数
 */
export interface LogOutParams {
  tenantCode: string;
  tenantId: number;
  token: string;
}

/**
 * 检验菜单
 * @param isDefaultUrl 是否需要跳转默认菜单，0不需要，1需要
 */
export interface CheckMenuParams {
  url: string;
}

/**
 * 菜单鉴权响应结果
 */
export interface CheckMenuRes {
  buttons: string[];
  checkMenuVO: { checkResult: boolean; defaultUrl: string };
}

/**
 * 更新选中院区参数
 */
export interface UpdateSelectedCampusParams {
  code: string;
  item?: string;
  orderId?: number;
  suiteId?: number;
  tenantId: string;
  type?: number;
  userId: string;
}
