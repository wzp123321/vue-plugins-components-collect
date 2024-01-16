/*************************************** 类型 **************************************************************/
/**
 * 通用请求响应体
 * @param code 响应码
 * @param message 响应消息
 * @param success 响应是否成功
 * @param data 响应内容
 */
export interface Common_IHttpRes<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}
/**
 * 通用列表请求响应体
 * @param list 列表内容
 * @param pageNum 列表页码
 * @param pageSize 页面大小
 * @param pages 总页数
 * @param total 总数据条数
 */
export interface Common_IHttpListRes<T> {
  list: T;
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
}
/**
 * 通用code、name
 */
export interface Common_ICodeName<T = string> {
  code: T;
  name: string;
}
/**
 * 通用value、label
 */
export interface Common_IValueLabel<T = string> {
  value: T;
  label: string;
}
/**
 * 通用id、name
 */
export interface Common_IIdName<T = string> {
  id: T;
  name: string;
}
// 租户信息
export interface Common_ITenantVO {
  /**
   * 租户id
   */
  tenantId: number;
  /**
   * 租户code
   */
  tenantCode: string;
}
// 公共对象接口
export interface Common_IObject {
  [key: string]: string | number | string[] | number[] | unknown | undefined;
}
/**
 * 公共院区入参
 */
export interface Common_IHospital {
  hospitalCodeList: string[];
  wholeHospitalFlag: boolean;
}

/*************************************** 枚举 **************************************************************/
// 树类型
export enum Common_ETreeType {
  区域树 = 1,
  业态树 = 2,
  支路树 = 3,
  科室树 = 4,
}
// 文件导出类型
export enum Common_EFileDownloadType {
  下载 = '下载',
  导出 = '导出',
}
