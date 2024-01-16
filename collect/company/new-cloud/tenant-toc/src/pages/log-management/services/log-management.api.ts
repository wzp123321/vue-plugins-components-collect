/** 接口返参 start */
export interface ordersType {
  asc: boolean;
  column: string;
}
export interface getListUrlType {
  pageNum: number;
  pageSize: number;
  orderByTime: boolean;
  keyword: string;
  tenantCode: string;
  operationName: string;
  startTime: string;
  endTime: string;

  objectId?: string;
}
export interface logDetailsListType {
  attributeName: string;
  attributeAlias: string;
  oldValue: string | null;
  newValue: string;
  id: number;
  operationId: number;
}
export interface updateUrlType {
  pageNum: number;
  pageSize: number;
  orderByTime: string;
  keyword: string;
  operationName: string;
  startTime: string;
  endTime: string;
  tenantCode: string;
  appName: string;
  logIdList: number[];
}

/** 列表接口响应 */
export interface HttpListResponsive<T> {
  list: T;
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}
export interface CommonObject {
  [key: string]: any;
}
