/**
 * 通用请求响应体
 * @param code 响应码
 * @param message 响应消息
 * @param success 响应是否成功
 * @param data 响应内容
 */
export interface CommonIHttpRes<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}
/**
 * 通用code、name
 */
export interface CommonICodeName<T = string> {
  code: T;
  name: string;
}
/**
 * 通用key、value
 */
export interface Common_IKeyValue<T = string> {
  key: T;
  value: string;
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
export interface Common_TS_IIdName<T = string> {
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
  [key: string]: unknown;
}

/**
 * 用户角色
 */
export interface Common_IUserRoleVO {
  loginName: string;
  regionCode: string;
  roleCode: string;
  roleId: string;
  roleName: string;
  userId: string;
}

// 系统页面类型
export enum CommonEPageType {
  TOC页面 = '-1',
  项目级页面 = '2',
}
