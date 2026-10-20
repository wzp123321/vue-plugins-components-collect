import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type {
  HttpClientConfig,
  RequestConfig,
  ResponseData,
  EncryptConfig,
} from "./type";
import { HTTP_STATUS, ERROR_MESSAGE_MAP, BUSINESS_CODE } from "./constant";
import { createRequestSuccessInterceptor } from "./interceptors/request";
import {
  createResponseSuccessInterceptor,
  createResponseErrorInterceptor,
} from "./interceptors/response";
import { extractErrorMessage, showErrorMessage } from "./utils/errorMessage";
import { cacheManager, CacheManager } from "./utils/features/cache";
import { mergeConfigWithPriority } from "./utils/configMerge";
import {
  getHttpClientConfig,
  initGateway,
  getEncryptKey,
} from "./utils/config";
import type { CacheStorageType } from "./utils/features/cache";
import { CancelTokenManager } from "./utils/features/cancel";
import {
  encryptRequestData,
  decryptResponseData,
  handleRequestEncrypt,
  handleResponseDecrypt,
} from "./utils/features/encrypt";
/**
 * HTTP 客户端类
 * 基于 axios.create() 组合模式，提供缓存、重试、取消等增强功能
 * 同时支持访问 axios 的所有原生 API
 */
export class HttpClient {
  public instance: AxiosInstance; // 暴露 axios 实例，允许外部自定义

  private config: HttpClientConfig;

  private cancelTokenManager: CancelTokenManager;

  // 保存内部拦截器 ID，用于更新配置时移除旧的拦截器
  private internalInterceptorIds: {
    requestId?: number; // 请求拦截器 ID
    responseId?: number; // 响应拦截器 ID
  } = {};

  constructor(config: HttpClientConfig) {
    // 使用 axios.create() 创建实例，自动继承所有默认配置
    this.instance = axios.create({
      ...config,
    });

    this.config = {
      ...config,
    };

    // 创建取消令牌管理器
    const maxCancelTokenCount = this.config.cancel?.maxCount ?? 100;
    this.cancelTokenManager = new CancelTokenManager(maxCancelTokenCount);

    // 设置拦截器
    this.setupInterceptors();
  }

  /**
   * 移除内部拦截器
   * 用于更新配置时清除旧的拦截器，避免重复添加
   */
  private removeInternalInterceptors = (): void => {
    if (this.internalInterceptorIds.requestId !== undefined) {
      this.instance.interceptors.request.eject(
        this.internalInterceptorIds.requestId
      );
      this.internalInterceptorIds.requestId = undefined;
    }
    if (this.internalInterceptorIds.responseId !== undefined) {
      this.instance.interceptors.response.eject(
        this.internalInterceptorIds.responseId
      );
      this.internalInterceptorIds.responseId = undefined;
    }
  };

  /**
   * 设置拦截器
   */
  private setupInterceptors = (): void => {
    // 先移除旧的内部拦截器，避免重复添加
    this.removeInternalInterceptors();

    // 请求拦截器
    const requestId = this.instance.interceptors.request.use(
      createRequestSuccessInterceptor({
        config: this.config,
        cancelTokenManager: this.cancelTokenManager,
      }),
      (error) => Promise.reject(error)
    );
    this.internalInterceptorIds.requestId = requestId;

    // 响应拦截器
    // 注意：即使全局没开启取消，也要传递 cancelTokenManager
    // 因为请求级别可能开启了取消功能
    const responseId = this.instance.interceptors.response.use(
      createResponseSuccessInterceptor({
        config: this.config,
        cancelTokenManager: this.cancelTokenManager, // 总是传递，由拦截器内部判断是否清理
        axiosInstance: this.instance, // 传递 axios 实例
      }),
      createResponseErrorInterceptor({
        config: this.config,
        cancelTokenManager: this.cancelTokenManager, // 总是传递，由拦截器内部判断是否清理
        axiosInstance: this.instance, // 传递 axios 实例
      })
    );
    this.internalInterceptorIds.responseId = responseId;
  };

  /**
   * GET 请求（支持缓存）
   * R -- 响应类型
   * T -- 响应体中的data数据类型
   * D -- 请求体中的data数据类型
   */
  get = <T = any, R = ResponseData<T>, D = any>(
    url: string,
    config?: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => {
    const cachedData = this.tryGetFromCache<T, R>(url, config, "GET");
    if (cachedData !== null) {
      return Promise.resolve(cachedData);
    }
    return this.instance.get<T, R, D>(url, config);
  };

  /**
   * POST 请求（支持缓存）
   */
  post = <T = any, R = ResponseData<T>, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => {
    const cachedData = this.tryGetFromCache<T, R>(url, config, "POST", data);
    if (cachedData !== null) {
      return Promise.resolve(cachedData);
    }
    return this.instance.post<T, R, D>(url, data, config);
  };

  /**
   * PUT 请求
   */
  put = <T = any, R = ResponseData<T>, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => this.instance.put<T, R, D>(url, data, config);

  /**
   * DELETE 请求
   */
  delete = <T = any, R = ResponseData<T>, D = any>(
    url: string,
    config?: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => this.instance.delete<T, R, D>(url, config);

  /**
   * PATCH 请求
   */
  patch = <T = any, R = ResponseData<T>, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => this.instance.patch<T, R, D>(url, data, config);

  /**
   * 请求方法（支持自定义方法）
   * 根据 method 调用对应的封装方法，保持封装逻辑的一致性
   */
  request = <T = any, R = ResponseData<T>, D = any>(
    config: RequestConfig & AxiosRequestConfig<D>
  ): Promise<R> => {
    const method = (config.method || "GET").toUpperCase();
    const { url, data, ...restConfig } = config;

    if (!url) {
      return this.instance.request<T, R, D>(config);
    }

    // 根据 method 调用对应的封装方法
    switch (method) {
      case "GET":
        return this.get<T, R, D>(url, restConfig);
      case "POST":
        return this.post<T, R, D>(url, data, restConfig);
      case "PUT":
        return this.put<T, R, D>(url, data, restConfig);
      case "DELETE":
        return this.delete<T, R, D>(url, restConfig);
      case "PATCH":
        return this.patch<T, R, D>(url, data, restConfig);
      default:
        // 其他自定义方法直接调用 axios 实例
        return this.instance.request<T, R, D>(config);
    }
  };

  /**
   * 更新配置
   */
  updateConfig = (config: HttpClientConfig): void => {
    this.config = getHttpClientConfig(config);
    // 同步重建 CancelTokenManager，确保 maxCount 生效
    this.cancelTokenManager = new CancelTokenManager(
      this.config.cancel?.maxCount ?? 100
    );
    // 重新设置拦截器
    this.setupInterceptors();
  };

  /**
   * 取消所有待处理的请求
   */
  cancelAll = (): void => {
    this.cancelTokenManager.clearAll();
  };

  /**
   * 尝试从缓存获取数据
   * 优先级：请求配置 cache > 全局配置 cache
   * 若缓存数据为加密存储，则先解密再返回
   * @returns 缓存命中返回缓存数据，否则返回 null
   */
  private tryGetFromCache = <T = any, R = ResponseData<T>>(
    url: string,
    config: RequestConfig | undefined,
    method: "GET" | "POST",
    data?: any
  ): R | null => {
    const cacheConfig = config?.cache ?? this.config.cache;
    if (!cacheConfig?.enable || cacheConfig.forceRefresh) {
      return null;
    }

    // 使用原始 data 生成缓存 key（避免每次缓存查找都执行加密）
    // 请求拦截器中也使用原始 data 生成 key，保持一致
    const keyGenerator =
      cacheConfig.keyGenerator || CacheManager.generateKey.bind(CacheManager);
    const cacheKey = keyGenerator({ ...config, url, method, data });
    const cachedData = this.getCache<T>(config || {}, cacheKey);
    if (cachedData === null) {
      return null;
    }

    // 获取加密配置（用于缓存命中后的解密）
    const encryptConfig: EncryptConfig | undefined = mergeConfigWithPriority(
      this.config.encrypt as Record<string, any> | undefined,
      config?.encrypt as Record<string, any> | undefined
    ) as EncryptConfig | undefined;

    // 根据缓存写入时的标记决定是否解密，而非依赖全局 encryptConfig
    // 避免隐式依赖"缓存存加密数据"的顺序约定
    const cached = cachedData as unknown as {
      data: ResponseData<T>;
      isCachedEncrypted: boolean;
    };
    if (cached?.isCachedEncrypted && encryptConfig?.key) {
      const result = handleResponseDecrypt(
        cached.data as unknown,
        encryptConfig
      );
      if (result?.success) {
        return result.decrypted as unknown as R;
      }
      return cached.data as unknown as R;
    }

    // 未加密缓存，直接取 data 字段（兼容旧缓存格式：直接存 responseData）
    const finalData =
      cached?.isCachedEncrypted !== undefined ? cached.data : cachedData;
    return finalData as unknown as R;
  };

  /**
   * 检查并获取缓存
   */
  private getCache = <T = any>(
    config: RequestConfig,
    cacheKey: string
  ): ResponseData<T> | null => {
    // 优先级：请求配置 cache > 全局配置 cache
    const cacheConfig = config?.cache ?? this.config.cache;
    if (!cacheConfig?.enable || cacheConfig.forceRefresh) {
      return null;
    }

    const storageType = cacheConfig.storageType || "memory";
    const cachedData = cacheManager.get<ResponseData<T>>(cacheKey, storageType);
    return cachedData;
  };
}

/**
 * 创建 HTTP 客户端实例
 * 使用 axios.create() 组合模式，自动继承所有默认配置（包括 transformRequest）
 * 支持所有 axios 原生 API，同时提供缓存、重试、取消等增强功能
 */
export async function createHttpClient(
  config: HttpClientConfig = { appId: "" }
): Promise<HttpClient> {
  // 自动初始化 Gateway
  if (config.appId) {
    await initGateway(config.appId);
  }

  // 获取 HTTP 客户端全局配置
  const httpClientConfig: HttpClientConfig = getHttpClientConfig(config);
  const httpClient = new HttpClient(httpClientConfig);

  return httpClient;
}

// 导出基本类型
export * from "./type";

// 导出常量
export { HTTP_STATUS, ERROR_MESSAGE_MAP, BUSINESS_CODE };

// 导出缓存管理器相关工具
export { cacheManager, CacheManager } from "./utils/features/cache";
// 导出缓存相关类型
export type { CacheStorageType };

// 导出错误消息处理工具
export { extractErrorMessage, showErrorMessage };

// 导出数据加解密业务处理工具
export {
  encryptRequestData,
  decryptResponseData,
  handleRequestEncrypt,
  handleResponseDecrypt,
};

// 导出配置合并工具
export {
  mergeConfig,
  mergeRetryConfig,
  mergeConfigWithPriority,
} from "./utils/configMerge";

// 导出获取 HTTP 客户端全局配置的通用方法
export { getHttpClientConfig, initGateway, getEncryptKey };
