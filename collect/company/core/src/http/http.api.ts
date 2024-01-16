/**
 * 通信状态枚举
 * *const
 * @param block 阻塞
 * @param success 成功
 * @param error 失败
 */
export const enum HTTP_EState {
  /**
   * 阻塞（一般为请求进行中）
   */
  block,
  /** 成功 */
  success,
  /** 失败 */
  error,
}

/**
 * 请求头内容格式枚举
 * *const
 */
export const enum HTTP_EContent {
  json = "application/json",
  form = "multipart/form-data",
}

/**
 * 结果集接口
 * @types 泛型<T> -T：转换后数据的类型（默认为void）
 * @param data 隔离转换后的数据
 * @param state 请求状态
 * @param message 异常信息
 */
export interface HTTP_IResult<T = void> {
  /** 隔离转换后的数据 */
  data: T | null;
  /** 请求状态 */
  state: HTTP_EState;
  /**
   * 异常代码
   * !仅限请求失败后存在
   *  */
  code?: number;
  /**
   * 异常信息
   * !仅限请求失败后存在
   */
  message?: string;
}

/**
 * 配置信息接口
 * @param proxy 代理标记
 * @param type 请求头类型标记
 * @param headers 请求头参数
 * @param throttle 节流控制
 * @param debounce 防抖控制
 */
export interface HTTP_IConfig {
  /** 代理标记 */
  readonly proxy?: string;
  /** 请求头类型标记 */
  readonly type?: HTTP_EContent;
  /**
   * 请求头参数
   * *参数项的值建议自行编码以避免乱码问题
   * !会覆盖默认请求头中的重复项（若存在）
   */
  readonly headers?: { [key: string]: string };
  /**
   * 节流控制
   * !以毫秒为单位进行配置
   */
  readonly throttle?: number;
  /**
   * 防抖控制
   * !以毫秒为单位进行配置
   */
  readonly debounce?: number;
}

export type HTTP_TInterceptor<T> = (v: T) => Promise<T>;
