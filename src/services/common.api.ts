export interface ICommonObject {
  [key: string]: any;
}
export interface ICommonValueLabel<T = string> {
  value: T;
  label: string;
}
/**
 * 响应结果
 */
export interface ICommonRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}
/**
 * 文件上传报错详情
 */
export interface ICommonFileUploadErrorDetail {
  detail: string;
  position: string;
}
/**
 * 排序
 */
export interface ICommonListOrdersType {
  asc: boolean;
  column: string;
}
/**
 * 通用分页入参
 */
export interface ICommonPaginationQueryParams {
  pageNum: number;
  pageSize: number;
  searchCount?: boolean;
  orders?: ICommonListOrdersType[];
}
/**
 * 时间颗粒度
 */
export enum ECommonTimeUnit {
  MINUTES = '10m', // 十分钟
  HOUR = '1h', // 1小时
  DAY = '1d', // 天
  MONTH = '1M', // 月
  YEAR = '1y',
}
