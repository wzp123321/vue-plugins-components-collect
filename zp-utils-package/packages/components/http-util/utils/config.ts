/**
 * HTTP 客户端全局配置
 */
import { mergeWith, isNil } from "lodash-es";
import { TeMessage } from "@tiansu/element-plus";
import { Access } from "../../gate-way/initAccess";
import type { AxiosError, AxiosResponse } from "axios";
import type {
  HttpClientConfig,
  RequestInterceptorConfig,
  ResponseInterceptorConfig,
  RetryConfig,
  CancelConfig,
  CacheConfig,
  EncryptConfig,
  ResponseData,
} from "../type";
import { HTTP_STATUS, BUSINESS_CODE } from "../constant";

/**
 * Gateway 初始化状态
 */
let gatewayInitialized = false;
let encryptKeyCache: string | null = null;

/**
 * 初始化 Gateway
 * @param appId 应用ID，由用户创建 HttpClient 时传入
 */
export async function initGateway(appId: string): Promise<void> {
  if (gatewayInitialized) {
    return;
  }
  if (!appId) {
    console.warn("未传入 appId，跳过 Gateway 初始化");
    return;
  }
  await Access.init({ appId });
  gatewayInitialized = true;
}

/**
 * 获取加密密钥
 * @param appId 应用ID
 */
export function getEncryptKey(appId: string): string | null {
  if (encryptKeyCache !== null) {
    return encryptKeyCache;
  }
  try {
    encryptKeyCache = Access.getSecretKeyByAppId(appId);
    return encryptKeyCache;
  } catch (error) {
    console.error("获取加密密钥失败:", error);
    return null;
  }
}

/**
 * 获取 Access 实例（用于 retryAccessToken）
 */
export function getAccess(): typeof Access {
  return Access;
}

/**
 * 数据合并器--主要用于合并配置，基于lodash的mergeWith，深度递归合并。
 * 此方法会修改并返回defaultConfig对象
 * @param defaultConfig 默认配置
 * @param userConfig 用户配置
 */
const mergeHttpConfig = (
  defaultConfig: Record<string, any>,
  userConfig: Record<string, any>
) => {
  const customizer = (_tarValue: unknown, srcValue: unknown) => {
    // 如果srcValue为数组，则直接返回srcValue
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
    // 如果srcValue为null、undefined，则返回_tarValue--即默认配置
    if (isNil(srcValue) && !isNil(_tarValue)) {
      return _tarValue;
    }
    // 其它情况由mergeWith原生逻辑处理
    return undefined;
  };

  return mergeWith(defaultConfig, userConfig, customizer);
};

/**
 * 创建 HTTP 客户端全局配置
 * @param config 配置 -- 如不传入，则创建默认配置
 * @returns HTTP 客户端全局配置
 */
export const getHttpClientConfig = (
  config: HttpClientConfig = { appId: "" }
): HttpClientConfig => {
  // 默认的请求拦截器配置
  const defaultRequestInterceptor: RequestInterceptorConfig = {};

  // 默认的响应拦截器配置
  const defaultResponseInterceptor: ResponseInterceptorConfig = {
    successCode: HTTP_STATUS.SUCCESS.Ok,
    businessSuccessCode: BUSINESS_CODE.SUCCESS,
    tokenInvalidCodes: [...BUSINESS_CODE.TOKEN_INVALID_CODES],
    gatewayAuthInvalidCodes: [...BUSINESS_CODE.GATEWAY_AUTH_INVALID_CODES],
    errorDebounceWait: 3000, // 3秒错误防抖
  };
  Object.assign(defaultResponseInterceptor, {
    showErrorMessage: (
      errMsg: string,
      _config: ResponseInterceptorConfig,
      _response?: AxiosResponse<ResponseData, any>,
      _error?: AxiosError<ResponseData, any>
    ) => {
      try {
        TeMessage.error({
          dangerouslyUseHTMLString: true,
          message: `${errMsg}
          <br>traceid：${_response?.config?.headers["trace-id"] || ""}
          <br>错误码：${_response?.data?.errcode || _response?.status || ""}`,
          duration:
            _config?.errorDebounceWait ||
            defaultResponseInterceptor.errorDebounceWait,
        });
      } catch (error) {
        console.error(
          "消息提示失败:",
          error,
          "，状态码:",
          _error?.response?.status
        );
      }
    },
  });

  // 默认的缓存配置
  const defaultCacheConfig: CacheConfig = {
    enable: false, // 默认关闭缓存
    storageType: "localStorage", // 默认localStorage存储
    expireTime: 5 * 60 * 1000, // 5分钟缓存过期时间 默认5分钟
    forceRefresh: false, // 默认不强制刷新缓存
  };

  // 默认的重试配置
  const defaultRetryConfig: RetryConfig = {
    enable: false, // 默认关闭重试
    count: 3, // 默认3次重试
    delay: 1000, // 默认1秒重试延迟
  };

  // 默认的取消配置
  const defaultCancelConfig: CancelConfig = {
    enable: true, // 默认开启取消请求
    maxCount: 100, // 默认100个取消令牌
  };

  // 默认的加密配置
  const defaultEncryptConfig: EncryptConfig = {
    enable: true, // 默认开启加密
  };

  const encrypt = config.encrypt
    ? (mergeHttpConfig(defaultEncryptConfig, config.encrypt) as EncryptConfig)
    : defaultEncryptConfig;

  // 如果传入了 appId，自动获取并注入加密密钥 -- 使用自动获取服务，必须开启内部initGateway流程
  if (encrypt.enable === true && !encrypt.key && config.appId) {
    const key = getEncryptKey(config.appId);
    if (key) {
      encrypt.key = key;
    }
  }

  // 合并用户配置
  return {
    ...config,
    timeout: config.timeout || 60000, // 默认60秒超时时间
    withTraceId:
      typeof config.withTraceId === "boolean" ? config.withTraceId : true, // 默认在请求头中添加 trace-id
    // 合并功能特性配置
    cancel: config.cancel
      ? (mergeHttpConfig(defaultCancelConfig, config.cancel) as CancelConfig)
      : defaultCancelConfig,
    retry: config.retry
      ? (mergeHttpConfig(defaultRetryConfig, config.retry) as RetryConfig)
      : defaultRetryConfig,
    cache: config.cache
      ? (mergeHttpConfig(defaultCacheConfig, config.cache) as CacheConfig)
      : defaultCacheConfig,
    encrypt,
    requestInterceptor: config.requestInterceptor
      ? (mergeHttpConfig(
          defaultRequestInterceptor,
          config.requestInterceptor
        ) as RequestInterceptorConfig)
      : defaultRequestInterceptor,
    responseInterceptor: config.responseInterceptor
      ? (mergeHttpConfig(
          defaultResponseInterceptor,
          config.responseInterceptor
        ) as ResponseInterceptorConfig)
      : defaultResponseInterceptor,
  } as const;
};

/**
 * 默认的 HTTP 客户端全局配置
 */
export const DEFAULT_HTTP_CLIENT_CONFIG = getHttpClientConfig();
