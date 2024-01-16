/**
 * 地址栏参数
 */
export interface URLQueryParams {
  showtype: string;
  corpid: string;
  token: string;
}

/**
 * 校验token 响应结果
 */
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

/**
 * http请求
 */
export interface HttpResponseImpl<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

/**
 * 校验token参数
 */
export interface KeepAliveParams {
  tenantCode: string;
  tenantId: number;
  token: string;
}

/**
 * 通用code、name
 */
export interface Common_ICodeName<T = string> {
  code: T;
  name: string;
}

/**
 * 通用列表响应
 */
export interface Common_IHttpListResponsive<T> {
  list: T;
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface CommonObject {
  [key: string]: any;
}

// excel文件上传后缀名
export const EXCEL_ACCEPT_EXTENSIONS = {
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
};

export const MAXIMUN_SIZE = 10; // 文件大小限制 -MB

export const MAXIMUN_TOTAL_SIZE = 100; // 总大小

/**
 * 登出参数
 */
export interface LogOutParams {
  tenantCode: string;
  tenantId: number;
  token: string;
}
