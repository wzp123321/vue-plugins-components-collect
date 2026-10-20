/**
 * 响应拦截器
 */
import type {
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import type {
  CacheConfig,
  RequestConfig,
  HttpClientConfig,
  EncryptConfig,
  ResponseData,
} from '../type';
import { handleResponseData, handleHttpError } from '../utils/errorHandler';
import { cacheManager } from '../utils/features/cache';
import type { CancelTokenManager } from '../utils/features/cancel';
import {
  shouldRetry,
  getRetryConfig,
  executeRetry,
} from '../utils/features/retry';
import { mergeConfigWithPriority } from '../utils/configMerge';
import { handleResponseDecrypt } from '../utils/features/encrypt';

/**
 * 处理取消令牌清理
 * 请求完成后（包括错误），从取消管理器中移除
 * 注意：如果请求被取消，abort 事件已经处理了清理，这里不会重复清理
 */
function handleCancelTokenCleanup(
  config: InternalAxiosRequestConfig | undefined,
  cancelTokenManager: CancelTokenManager,
): void {
  // 如果请求配置中有 signal（说明创建了 AbortController），则需要清理
  if (cancelTokenManager && config?.signal) {
    cancelTokenManager.removeItem(config);
  }
}

/**
 * 处理响应缓存
 * 如果请求标记了需要缓存，则保存响应数据到缓存
 */
function handleResponseCache(response: AxiosResponse): void {
  // 注意：shouldCache、cacheKey、cacheConfig 是运行时在请求拦截器中添加的属性
  const requestConfig = response.config as any;
  if (requestConfig.shouldCache) {
    // 使用 cache 配置
    const cacheConfig: CacheConfig = requestConfig.cacheConfig;
    const cacheKey = requestConfig.cacheKey;
    const expireTime = cacheConfig.expireTime;
    const storageType = cacheConfig.storageType;

    // 保存响应数据到缓存，同时记录是否为加密数据
    // 缓存写入时 response.data 尚未解密（先缓存后解密），需打标记供读取时判断
    const isEncrypted = !!(response.config as any).isEncrypted;
    cacheManager.set(
      cacheKey,
      { data: response.data, isCachedEncrypted: isEncrypted },
      expireTime ?? 0,
      storageType,
    );
  }
}

/**
 * 处理响应数据解密
 * 当请求数据已加密时，解密响应数据
 */
function processResponseDecrypt(
  response: AxiosResponse,
  httpClientConfig: HttpClientConfig,
): void {
  const requestConfig = response.config as any;
  // 如果请求数据未有加密标识，则直接返回
  if (!requestConfig.isEncrypted) {
    return;
  }

  const encryptConfig: EncryptConfig | undefined = mergeConfigWithPriority(
    httpClientConfig.encrypt as Record<string, any> | undefined,
    requestConfig.encrypt as Record<string, any> | undefined,
  ) as EncryptConfig | undefined;

  const result = handleResponseDecrypt(response.data, encryptConfig);
  if (result?.success) {
    response.data = result.decrypted;
  }
}

/**
 * 处理请求重试
 * 检查是否应该重试，执行重试，并处理重试结果
 */
async function handleRetry({
  error,
  requestConfig,
  httpClientConfig,
  axiosInstance,
  cancelTokenManager,
}: {
  error: AxiosError<ResponseData, any>;
  requestConfig: RequestConfig & { retryCountAttempt?: number };
  httpClientConfig: HttpClientConfig;
  axiosInstance: AxiosInstance;
  cancelTokenManager: CancelTokenManager;
}): Promise<AxiosResponse | null> {
  // 检查是否应该重试
  if (!shouldRetry(error, requestConfig, httpClientConfig) || !axiosInstance) {
    return null;
  }

  try {
    // 执行重试
    const retryResponse = await executeRetry(
      error,
      requestConfig,
      httpClientConfig,
      axiosInstance,
    );

    // 如果重试成功，返回响应
    if (retryResponse) {
      return retryResponse;
    }

    // 如果返回 null，说明重试次数已用完，返回 null 让调用者处理错误
    return null;
  } catch (retryError) {
    // 重试失败，继续处理错误
    // 获取重试配置以判断是否达到最大重试次数
    const { retryCount } = getRetryConfig(requestConfig, httpClientConfig);
    if (
      requestConfig.retryCountAttempt &&
      requestConfig.retryCountAttempt >= retryCount
    ) {
      // 已达到最大重试次数，返回 null 让调用者处理错误
      return null;
    }

    // 否则继续重试（递归调用错误拦截器）
    // 注意：createResponseErrorInterceptor 是函数声明，会被提升，运行时不会有问题
    // eslint-disable-next-line no-use-before-define
    const errorInterceptor = createResponseErrorInterceptor({
      config: httpClientConfig,
      cancelTokenManager,
      axiosInstance,
    });
    return errorInterceptor(retryError as AxiosError<ResponseData, any>);
  }
}

/**
 * 创建响应成功拦截器
 */
export function createResponseSuccessInterceptor({
  config,
  cancelTokenManager,
  axiosInstance,
}: {
  config: HttpClientConfig;
  cancelTokenManager: CancelTokenManager;
  axiosInstance: AxiosInstance;
}) {
  return async (response: AxiosResponse) => {
    const { responseInterceptor = {} } = config;
    // 取消处理模块
    handleCancelTokenCleanup(response.config, cancelTokenManager);

    // 缓存处理模块 -- 先缓存后解密
    handleResponseCache(response);

    // 数据解密处理模块
    processResponseDecrypt(response, config);

    // 自定义成功处理
    if (config.responseInterceptor?.onSuccess) {
      return config.responseInterceptor.onSuccess(
        response,
        responseInterceptor,
        axiosInstance,
      );
    }

    // 默认处理
    if (responseInterceptor) {
      return handleResponseData(response, responseInterceptor, axiosInstance);
    }
    return response;
  };
}

/**
 * 创建响应错误拦截器
 */
export function createResponseErrorInterceptor({
  config,
  cancelTokenManager,
  axiosInstance,
}: {
  config: HttpClientConfig;
  cancelTokenManager: CancelTokenManager;
  axiosInstance: AxiosInstance;
}): (error: AxiosError<ResponseData, any>) => Promise<AxiosResponse | never> {
  return async (
    error: AxiosError<ResponseData, any>,
  ): Promise<AxiosResponse | never> => {
    const { responseInterceptor } = config;
    const response = error.response;

    // 取消处理模块
    handleCancelTokenCleanup(error.config, cancelTokenManager);

    // 数据解密处理模块（网络错误时 response 为 undefined，跳过解密）
    if (response) {
      processResponseDecrypt(response as AxiosResponse, config);
    }

    // 如果没有配置，直接返回错误处理
    if (!error.config) {
      // 自定义错误处理
      if (responseInterceptor?.onError) {
        return responseInterceptor.onError(
          responseInterceptor,
          error,
          axiosInstance,
        );
      }
      if (responseInterceptor) {
        return handleHttpError(
          error as AxiosError<ResponseData, any>,
          responseInterceptor,
          axiosInstance,
        );
      }
      return Promise.reject(error);
    }

    // 注意：RequestConfig 中的自定义字段（retry, retryCount, retryDelay 等）
    // 会通过 Axios 自动传递到这里，通过 error.config 可以访问
    const requestConfig = error.config as any as RequestConfig & {
      retryCountAttempt?: number; // 记录本次请求的重试次数
    };

    // 重试处理模块
    const retryResponse = await handleRetry({
      error,
      httpClientConfig: config,
      requestConfig,
      axiosInstance,
      cancelTokenManager,
    });

    // 如果重试成功，返回响应
    if (retryResponse) {
      return retryResponse;
    }

    // 不重试或重试次数已用完，执行错误处理
    // 自定义错误处理
    if (responseInterceptor?.onError) {
      return responseInterceptor.onError(
        responseInterceptor,
        error,
        axiosInstance,
      );
    }

    // 默认错误处理
    if (responseInterceptor) {
      return handleHttpError(
        error as AxiosError<ResponseData, any>,
        responseInterceptor,
        axiosInstance,
      );
    }
    return Promise.reject(error);
  };
}
