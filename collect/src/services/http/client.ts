/**
 * 客户端工厂
 *
 * ```ts
 * const http = createHttpClient({
 *   baseURL: '/hlms/api',
 *   tokenManager: createTokenManager({ refreshApi, onAuthFailed }),
 *   getHeaders: () => ({ tenantCode: getTenant() }),
 *   onError: (err) => ElMessage.error(getErrorMessage(err)),
 * });
 *
 * const list = await http.get<DatasetVO[]>('/dataset/list', { params: { page: 1 } });
 * ```
 */
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { HttpError } from './errors';
import { createCodeGetter, createMessageGetter, installInterceptors } from './interceptors';
import type { HttpClientConfig, HttpResult, ResolvedHttpClientConfig, TokenManager } from './types';

export interface DownloadResult {
  blob: Blob;
  /** 从 Content-Disposition 解析出的文件名 */
  filename?: string;
}

export interface HttpClient {
  /** 原生 axios 实例：需要特殊配置（如 SDK 内部请求）时用 */
  instance: AxiosInstance;
  /** 返回解包后的 data */
  request: <T>(config: AxiosRequestConfig) => Promise<T>;
  /** 返回完整包体（需要 errcode / secretFields 时用） */
  requestFull: <T>(config: AxiosRequestConfig) => Promise<HttpResult<T>>;
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  /** 文件下载：自动识别「200 + JSON 错误体」并抛 BizError */
  download: (url: string, config?: AxiosRequestConfig) => Promise<DownloadResult>;
  /** 文件上传：FormData 交给浏览器设置 boundary */
  upload: <T>(url: string, form: FormData, config?: AxiosRequestConfig) => Promise<T>;
  /** 运行时替换令牌管理器（如登录后切换租户） */
  setTokenManager: (manager?: TokenManager) => void;
}

const DEFAULT_SUCCESS_CODES: Array<string | number | boolean> = ['0', 0, 200, '200', true];

/** 合并默认配置 */
const resolveConfig = (config: HttpClientConfig): ResolvedHttpClientConfig => {
  const unauthorizedCodes = config.unauthorizedCodes ?? [401, '401', '46010001'];

  return {
    baseURL: config.baseURL ?? '/api',
    timeout: config.timeout ?? 60000,
    getCode: config.getCode ?? createCodeGetter(),
    getMessage: config.getMessage ?? createMessageGetter(),
    successCodes: config.successCodes ?? DEFAULT_SUCCESS_CODES,
    authHeaderName: config.authHeaderName ?? 'Authorization',
    authHeaderPrefix: config.authHeaderPrefix ?? 'Bearer ',
    traceHeaderName: config.traceHeaderName === undefined ? 'x-trace-id' : config.traceHeaderName,
    unauthorizedCodes,
    isUnauthorized:
      config.isUnauthorized ??
      (({ status, code }) =>
        status === 401 ||
        (code !== undefined && unauthorizedCodes.some((item) => String(item) === String(code)))),
    unwrapData: config.unwrapData ?? true,
    dedupe: config.dedupe ?? false,
    getHeaders: config.getHeaders,
    tokenManager: config.tokenManager,
    onError: config.onError ?? (() => undefined),
    retry: {
      enabled: (config.retry?.maxRetries ?? 0) > 0,
      maxRetries: config.retry?.maxRetries ?? 0,
      retryStatuses: config.retry?.retryStatuses ?? [408, 429, 500, 502, 503, 504],
      baseDelayMs: config.retry?.baseDelayMs ?? 300,
      maxDelayMs: config.retry?.maxDelayMs ?? 3000,
      idempotentOnly: config.retry?.idempotentOnly ?? true,
    },
  };
};

/** 从 Content-Disposition 解析文件名，兼容 filename*=UTF-8'' 与普通 filename */
const parseFilename = (disposition?: string): string | undefined => {
  if (!disposition) return undefined;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1]?.trim();
};

export const createHttpClient = (options: HttpClientConfig = {}): HttpClient => {
  const config = resolveConfig(options);

  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
  });

  installInterceptors(instance, config);

  /** 并发去重表：GET 同一 URL+参数同时只发一次 */
  const inflight = new Map<string, Promise<unknown>>();

  const dedupeKey = (cfg: AxiosRequestConfig): string => {
    const params = cfg.params ? JSON.stringify(cfg.params) : '';
    return `${(cfg.method ?? 'get').toUpperCase()} ${cfg.url ?? ''} ${params}`;
  };

  const withDedupe = <T>(cfg: AxiosRequestConfig, task: () => Promise<T>): Promise<T> => {
    if (!config.dedupe || (cfg.method ?? 'get').toUpperCase() !== 'GET') return task();
    const key = dedupeKey(cfg);
    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;
    const promise = task();
    inflight.set(key, promise);
    promise
      .catch(() => undefined)
      .finally(() => {
        if (inflight.get(key) === promise) inflight.delete(key);
      });
    return promise;
  };

  const unwrap = <T>(body: HttpResult<T>): T =>
    config.unwrapData ? body.data : (body as unknown as T);

  const requestFull = async <T>(cfg: AxiosRequestConfig): Promise<HttpResult<T>> => {
    const response: AxiosResponse<HttpResult<T>> = await withDedupe(cfg, () => instance.request<HttpResult<T>>(cfg));
    return response.data;
  };

  const request = async <T>(cfg: AxiosRequestConfig): Promise<T> => unwrap<T>(await requestFull<T>(cfg));

  return {
    instance,

    request,
    requestFull,

    get: <T>(url: string, cfg: AxiosRequestConfig = {}) => request<T>({ ...cfg, url, method: 'GET' }),

    post: <T>(url: string, data?: unknown, cfg: AxiosRequestConfig = {}) =>
      request<T>({ ...cfg, url, method: 'POST', data }),

    put: <T>(url: string, data?: unknown, cfg: AxiosRequestConfig = {}) =>
      request<T>({ ...cfg, url, method: 'PUT', data }),

    patch: <T>(url: string, data?: unknown, cfg: AxiosRequestConfig = {}) =>
      request<T>({ ...cfg, url, method: 'PATCH', data }),

    delete: <T>(url: string, cfg: AxiosRequestConfig = {}) => request<T>({ ...cfg, url, method: 'DELETE' }),

    download: async (url: string, cfg: AxiosRequestConfig = {}): Promise<DownloadResult> => {
      const response = await instance.request<Blob>({
        ...cfg,
        url,
        method: cfg.method ?? 'GET',
        responseType: 'blob',
      });
      const data = response.data;
      if (!(data instanceof Blob)) {
        throw new HttpError('下载失败：响应不是文件流', { status: response.status, response });
      }
      return {
        blob: data,
        filename: parseFilename(response.headers['content-disposition'] as string | undefined),
      };
    },

    upload: <T>(url: string, form: FormData, cfg: AxiosRequestConfig = {}) =>
      request<T>({ ...cfg, url, method: 'POST', data: form }),

    setTokenManager: (manager?: TokenManager) => {
      config.tokenManager = manager;
    },
  };
}
