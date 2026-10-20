/**
 * 请求拦截器
 */
import type { InternalAxiosRequestConfig } from "axios";
import type {
  CacheConfig,
  RequestConfig,
  HttpClientConfig,
  EncryptConfig,
} from "../type";
import { createAbortController } from "../utils/features/cancel";
import type { CancelTokenManager } from "../utils/features/cancel";
import { CacheManager } from "../utils/features/cache";
import { mergeConfig, mergeConfigWithPriority } from "../utils/configMerge";
import { UuidUtil } from "../../uuid-util";
import { getAccess } from "../utils/config";
import { handleRequestEncrypt } from "../utils/features/encrypt";

/**
 * 处理缓存配置
 * 检查缓存配置并标记需要保存缓存的请求
 */
function handleCacheConfig(
  axiosConfig: InternalAxiosRequestConfig,
  defaultCacheConfig?: CacheConfig
): void {
  // 检查缓存配置
  // 优先级：请求配置 cache > 全局默认配置
  const requestConfig = axiosConfig as any as RequestConfig;
  const finalCacheConfig: CacheConfig | undefined = mergeConfigWithPriority(
    defaultCacheConfig as Record<string, any> | undefined,
    requestConfig.cache as Record<string, any> | undefined
  ) as CacheConfig | undefined;
  // 如果启用了缓存且未强制刷新，标记需要保存缓存
  // 注意：缓存检查已经在 HttpClient 的 get/post 方法中完成，这里只需要标记保存缓存
  const method = axiosConfig.method?.toLowerCase();
  const supportCache = method === "get" || method === "post";
  if (
    finalCacheConfig?.enable &&
    !finalCacheConfig?.forceRefresh &&
    supportCache
  ) {
    const keyGenerator =
      finalCacheConfig.keyGenerator ||
      CacheManager.generateKey.bind(CacheManager);
    const cacheKey = keyGenerator(axiosConfig);

    // 标记需要保存缓存（请求成功后保存）
    (axiosConfig as any).shouldCache = true;
    (axiosConfig as any).cacheKey = cacheKey;
    (axiosConfig as any).cacheConfig = finalCacheConfig;
  }
}

/**
 * 设置请求头
 */
function setRequestHeaders(
  axiosConfig: InternalAxiosRequestConfig,
  httpClientConfig: HttpClientConfig
): void {
  const { appId, withTraceId, requestInterceptor } = httpClientConfig;
  const requestConfig = axiosConfig as any as RequestConfig;
  const encryptConfig: EncryptConfig | undefined = mergeConfigWithPriority(
    httpClientConfig.encrypt as Record<string, any>,
    requestConfig.encrypt as Record<string, any>
  ) as EncryptConfig;

  let headers: Record<string, any> = {};
  Object.assign(
    headers,
    {
      "x-requested-with": "XMLHttpRequest",
      "Content-Type": encryptConfig?.enable ? "text/plain" : "application/json", // 国密要求使用text/plain类型
    },
    httpClientConfig.headers || {} // 先获取全局headers配置--假如有的话
  );
  // 非access-token鉴权的接口，加上access_token
  if (
    requestConfig.url?.indexOf("gateway/v1/auth") === -1 ||
    requestConfig.url?.indexOf("gateway/v2/auth") === -1
  ) {
    headers["access-token"] = getAccess().buildClientAccessToken();
  }
  // App ID
  if (appId) {
    headers["app-id"] = appId;
  }
  // Trace ID
  if (withTraceId) {
    if (appId) {
      headers[
        "trace-id"
      ] = `${appId}_${new Date().getTime()}_${UuidUtil.uuid32().substring(
        0,
        4
      )}`;
    } else {
      headers[
        "trace-id"
      ] = `${new Date().getTime()}_${UuidUtil.uuid32().substring(0, 4)}`;
    }
  }

  // 全局自定义请求头
  if (requestInterceptor?.customHeaders) {
    Object.assign(
      headers,
      requestInterceptor.customHeaders(axiosConfig, headers)
    );
  }
  // 局部headers优先级高于全局headers配置
  headers = mergeConfigWithPriority(headers, axiosConfig.headers) ?? headers;
  // 最后反合至axiosConfig.headers
  Object.assign(axiosConfig.headers, headers);
}

/**
 * 处理请求取消配置
 */
function handleCancelToken(
  httpClientConfig: HttpClientConfig,
  axiosConfig: InternalAxiosRequestConfig,
  cancelTokenManager: CancelTokenManager
): void {
  // 检查请求级别的取消配置
  // 优先级：请求配置 cancel.enable > 全局配置 cancel.enable > 默认值
  const requestConfig = axiosConfig as any as RequestConfig;
  const finalEnableCancel = mergeConfig<boolean>({
    local: requestConfig.cancel?.enable,
    global: httpClientConfig.cancel?.enable,
  });

  // 创建 AbortController 并配置到请求中
  // 如果请求级别开启了取消，即使全局没开启也要处理
  createAbortController(axiosConfig, cancelTokenManager, finalEnableCancel);
}

/**
 * 处理请求数据加密
 * 当开启加密且传递了加密密钥时，加密请求数据
 */
function processRequestEncrypt(
  axiosConfig: InternalAxiosRequestConfig,
  httpClientConfig: HttpClientConfig
): void {
  const requestConfig = axiosConfig as any as RequestConfig;
  const encryptConfig: EncryptConfig | undefined = mergeConfigWithPriority(
    httpClientConfig.encrypt as Record<string, any>,
    requestConfig.encrypt as Record<string, any>
  ) as EncryptConfig;

  const result = handleRequestEncrypt(axiosConfig.data, encryptConfig);
  if (result?.success) {
    axiosConfig.data = result.encrypted;
    (axiosConfig as any).isEncrypted = true;
  }
}

/**
 * 创建请求拦截器
 */
export function createRequestSuccessInterceptor({
  config,
  cancelTokenManager,
}: {
  config: HttpClientConfig;
  cancelTokenManager: CancelTokenManager;
}) {
  return async (axiosConfig: InternalAxiosRequestConfig) => {
    // 缓存处理模块（必须在加密前执行，使用原始 data 生成 cacheKey）
    handleCacheConfig(axiosConfig, config.cache);

    // 数据加密处理模块
    processRequestEncrypt(axiosConfig, config);

    // 请求头设置模块
    setRequestHeaders(axiosConfig, config);

    // 请求取消处理模块
    handleCancelToken(config, axiosConfig, cancelTokenManager);

    // 以上默认处理完后，再执行自定义请求前钩子，将最新的axiosConfig传递给自定义请求前钩子
    if (config.requestInterceptor?.onRequest) {
      await config.requestInterceptor.onRequest(axiosConfig);
    }

    return axiosConfig;
  };
}
