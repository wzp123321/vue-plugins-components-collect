export interface CommonObject {
  [key: string]: any;
}

/**
 * 响应结果
 */
export interface CommonRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * 文件上传报错详情
 */
export interface CommonFileUploadErrorDetail {
  detail: string;
  position: string;
}

/**
 * 通用分页入参
 */
export interface CommonPaginationQueryParams {
  pageNum: number;
  pageSize: number;
  searchCount?: boolean;
  orders?: CommonListOrdersType[];
}
/**
 * 排序
 */
export interface CommonListOrdersType {
  asc: boolean;
  column: string;
}
