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
