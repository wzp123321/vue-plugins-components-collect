import type {
  CreateAxiosDefaults,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";

/**
 * http响应 业务侧标准化数据结构
 */
export interface ResponseData<T = any> {
  data: T;
  errcode?: string;
  errmsg?: string;
  message?: string;
  secretFields?: string[];
  [key: string]: any;
}

/**
 * 公共响应类型
 */
export type CommonResponse<T> = Promise<ResponseData<T>>;

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 是否启用重试 */
  enable?: boolean;
  /** 重试次数 */
  count?: number;
  /** 重试延迟（毫秒） */
  delay?: number;
}

/**
 * 取消配置
 */
export interface CancelConfig {
  /** 是否启用取消 */
  enable?: boolean;
  /** 最大取消令牌数量 */
  maxCount?: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enable?: boolean;
  /** 缓存存储类型 */
  storageType?: "memory" | "localStorage" | "sessionStorage";
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  expireTime?: number;
  /** 缓存键生成函数 */
  keyGenerator?: (config: AxiosRequestConfig) => string;
  /** 是否强制刷新（忽略缓存） */
  forceRefresh?: boolean;
}

/**
 * 加密配置
 */
export interface EncryptConfig {
  /** 是否启用加密 */
  enable?: boolean;
  /** 加密密钥 */
  key?: string;
}

/**
 * 请求拦截器配置
 * 一些特性API允许用户自定义，覆盖默认处理逻辑
 */
export interface RequestInterceptorConfig {
  /** 自定义请求头处理 */
  customHeaders?: (
    config: InternalAxiosRequestConfig,
    globalHeaders: Record<string, any>
  ) => Record<string, any>;
  /** 请求前钩子 */
  onRequest?: (config: InternalAxiosRequestConfig) => void | Promise<void>;
}

/**
 * 响应拦截器配置
 * 一些特性API允许用户自定义，覆盖默认处理逻辑
 */
export interface ResponseInterceptorConfig {
  /** HTTP状态 成功码 默认200 */
  successCode?: number | number[];
  /** 业务侧 成功码 默认 "0" */
  businessSuccessCode?: string | string[];
  /** 错误提示消息防抖时间（毫秒） */
  errorDebounceWait?: number;
  /** token 无效的 errcode 列表 */
  tokenInvalidCodes?: string[];
  /** 网关鉴权失效的 errcode 列表 */
  gatewayAuthInvalidCodes?: string[];
  /** 登录失效弹窗确认处理函数 -- 登录失效时内部弹窗的确认按钮handler：业务侧自行处理失效跳转等逻辑 */
  onLoginInvalidConfirm?: () => void | Promise<void>;
  /**
   * 登录失效处理函数 -- 若显示传递则覆盖内部响应拦截器登录失效时的默认业务处理。
   * 即业务侧自行决定处理登录失效逻辑，包括是否弹窗等
   */
  onLoginInvalid?: () => void | Promise<void>;
  /** 错误消息提示函数 -- 1、若显示传递则覆盖所有发生错误时的错误提示 2、也可在该方法中追加对某些错误码的处理 */
  showErrorMessage?: (
    errMsg: string,
    config: ResponseInterceptorConfig,
    response?: AxiosResponse<ResponseData, any>,
    error?: AxiosError<ResponseData, any>
  ) => void;
  /** 自定义成功处理 -- 若显示传递则覆盖内部响应拦截器成功时【2xx】的默认业务处理 */
  onSuccess?: (
    response: AxiosResponse<ResponseData, any>,
    responseInterceptor: ResponseInterceptorConfig,
    axiosInstance: AxiosInstance
  ) => Promise<any>;
  /** @TODO: 自定义成功扩展处理 -- 在内部响应拦截器成功时【2xx】的默认业务处理之后执行，可用于对响应数据进行进一步处理 */
  onSuccessExtend?: (
    config: ResponseInterceptorConfig,
    response: AxiosResponse<ResponseData, any>,
    axiosInstance: AxiosInstance
  ) => Promise<any>;
  /** 自定义错误处理 -- 若显示传递则覆盖内部响应拦截器错误时【非2xx】的默认业务处理 */
  onError?: (
    responseInterceptor: ResponseInterceptorConfig,
    error: AxiosError<ResponseData, any>,
    axiosInstance: AxiosInstance
  ) => Promise<never>;
  /** 自定义错误扩展处理 -- 在内部响应拦截器默认的错误业务处理之后执行，可用于对状态码或业务码进一步处理 */
  onErrorExtend?: (
    config: ResponseInterceptorConfig,
    response?: AxiosResponse<ResponseData, any>,
    error?: AxiosError<ResponseData, any>,
    axiosInstance?: AxiosInstance
  ) => Promise<never>;
}

/**
 * http请求 局部配置扩展
 * 注意字段定义不要和 AxiosRequestConfig 冲突
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否隐藏错误提示 */
  hiddenErrorMessage?: boolean;
  /** 取消配置 */
  cancel?: Omit<CancelConfig, "maxCount">;
  /** 重试配置 */
  retry?: RetryConfig;
  /** 缓存配置 */
  cache?: CacheConfig;
  /** 加密配置 */
  encrypt?: EncryptConfig;
}

/**
 * http客户端 全局配置
 * 注意字段定义不要和 CreateAxiosDefaults 冲突
 */
export interface HttpClientConfig extends CreateAxiosDefaults {
  /** 应用ID--必传，用于gateway初始化等 */
  appId: string;
  /** 是否在请求头中添加 trace-id */
  withTraceId?: boolean;
  /** 请求拦截器配置 */
  requestInterceptor?: RequestInterceptorConfig;
  /** 响应拦截器配置 */
  responseInterceptor?: ResponseInterceptorConfig;
  /** 取消配置 */
  cancel?: CancelConfig;
  /** 重试配置 */
  retry?: RetryConfig;
  /** 缓存配置 */
  cache?: CacheConfig;
  /** 加密配置 */
  encrypt?: EncryptConfig;
}
