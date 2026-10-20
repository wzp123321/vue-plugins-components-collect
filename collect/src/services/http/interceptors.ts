/**
 * 请求 / 响应拦截器
 *
 * 只做四件事，职责边界清楚：
 *  1. 请求前：trace-id、动态业务头、鉴权头
 *  2. 响应后：blob 错误体还原、业务码判定
 *  3. 401：刷新令牌 → 重试原请求（只重试一次）
 *  4. 网络错误 / 5xx：按配置指数退避重试（只对幂等方法）
 *
 * 不做：解包 data（交给 client）、弹提示（交给 onError 回调）。
 */
import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { BizError, HttpError } from './errors';
import type { HttpResult, ResolvedHttpClientConfig } from './types';

/** 生成请求级 traceId：时间戳(36 进制) + 随机串，便于日志关联 */
export const createTraceId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** 读请求头（大小写不敏感），主要为了不覆盖调用方显式设置的值 */
const readHeader = (cfg: InternalAxiosRequestConfig, name: string): string | undefined => {
  const headers = cfg.headers as unknown as { get?: (n: string) => unknown } | undefined;
  if (headers && typeof headers.get === 'function') {
    const value = headers.get(name);
    return value === null || value === undefined ? undefined : String(value);
  }
  return undefined;
};

const writeHeader = (cfg: InternalAxiosRequestConfig, name: string, value: string): void => {
  const headers = cfg.headers as unknown as { set?: (n: string, v: string) => void };
  headers.set?.(name, value);
};

const removeHeader = (cfg: InternalAxiosRequestConfig, name: string): void => {
  const headers = cfg.headers as unknown as { delete?: (n: string) => void };
  headers.delete?.(name);
};

/** 只写不存在的头：调用方显式传的同名头优先 */
const writeHeaderIfAbsent = (cfg: InternalAxiosRequestConfig, name: string, value: string): void => {
  if (readHeader(cfg, name) === undefined) writeHeader(cfg, name, value);
};

/** 将响应体还原成业务包体；纯文件流返回 undefined */
const toHttpResult = async (data: unknown): Promise<HttpResult | undefined> => {
  if (!data) return undefined;

  // 下载接口：HTTP 200 但后端返回 JSON（统一异常处理），需先读出来判断
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    if (!/json/i.test(data.type)) return undefined;
    try {
      const text = await data.text();
      return text ? (JSON.parse(text) as HttpResult) : undefined;
    } catch {
      return undefined;
    }
  }

  if (typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return data as HttpResult;
  }
  return undefined;
};

const isSuccessCode = (code: string | number | boolean | undefined, config: ResolvedHttpClientConfig): boolean => {
  if (code === undefined) return true;
  return config.successCodes.some((item) => String(item) === String(code));
};

/** 统一的错误上报入口：取消的请求 `不提示` */
const reportError = (error: unknown, cfg: InternalAxiosRequestConfig | undefined, config: ResolvedHttpClientConfig) => {
  if (cfg?.skipErrorHandler) return;
  if (axios.isCancel(error)) return;
  config.onError?.(error);
};

/** 429/5xx/网络中断才值得重试；4xx 参数错误重试无意义 */
const shouldRetryByStatus = (status: number | undefined, config: ResolvedHttpClientConfig): boolean => {
  if (status === undefined) return true;
  return config.retry.retryStatuses.includes(status);
};

const isIdempotentMethod = (method: string | undefined): boolean =>
  ['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase());

export function installInterceptors(instance: AxiosInstance, config: ResolvedHttpClientConfig): void {
  /* ---------------------------- 请求 ---------------------------- */
  instance.interceptors.request.use(
    async (cfg) => {
      cfg._traceId = createTraceId();
      if (config.traceHeaderName) {
        writeHeaderIfAbsent(cfg, config.traceHeaderName, cfg._traceId);
      }

      if (config.getHeaders) {
        const extra = await config.getHeaders();
        Object.keys(extra).forEach((key) => writeHeaderIfAbsent(cfg, key, extra[key]));
      }

      // 每次读 config.tokenManager：支持运行时 setTokenManager 替换
      if (!cfg.skipAuth && config.tokenManager) {
        const token = config.tokenManager.getAccessToken();
        if (token) {
          writeHeader(cfg, config.authHeaderName, `${config.authHeaderPrefix}${token}`);
        }
      }

      return cfg;
    },
    (error) => Promise.reject(error),
  );

  /* ---------------------------- 响应 ---------------------------- */
  instance.interceptors.response.use(
    async (response: AxiosResponse) => {
      const cfg = response.config as InternalAxiosRequestConfig;
      const body = await toHttpResult(response.data);

      // 纯文件流（真正的下载成功）：直接放行
      if (!body) return response;

      const code = config.getCode(body);

      if (isSuccessCode(code, config)) return response;

      const message = config.getMessage(body) ?? '业务处理失败';
      const bizError = new BizError(message, { code, body, config: cfg });

      // 业务码也可能是「登录失效」（后端 200 + code:401 的写法）
      if (
        !cfg.skipAuth &&
        config.tokenManager &&
        config.isUnauthorized({ status: response.status, code, config: cfg, body })
      ) {
        const retried = await retryAfterRefresh(instance, cfg, config);
        if (retried) return retried;
      }

      reportError(bizError, cfg, config);
      throw bizError;
    },

    // 用 unknown 接收：axios.isCancel 是类型守卫，若参数直接标成 AxiosError，
    // 守卫会把 else 分支收窄成 never（AxiosError 与 CanceledError 泛型不重合）
    async (error: unknown) => {
      if (axios.isCancel(error)) {
        throw new HttpError('请求已取消', { kind: 'canceled', cause: error });
      }

      const axiosError = error as AxiosError;
      const cfg = axiosError.config as InternalAxiosRequestConfig | undefined;
      const response = axiosError.response;
      const status = response?.status;
      const body = response ? await toHttpResult(response.data) : undefined;
      const code = body ? config.getCode(body) : undefined;

      // ---- 401：刷新令牌后重试一次 ----
      if (cfg && !cfg.skipAuth && config.tokenManager && !cfg._authRetried) {
        if (config.isUnauthorized({ status, code, config: cfg, body })) {
          const retried = await retryAfterRefresh(instance, cfg, config);
          if (retried) return retried;
        }
      }

      // ---- 网络抖动 / 5xx：指数退避重试 ----
      if (cfg && config.retry.enabled) {
        const count = cfg._retryCount ?? 0;
        const idempotent = isIdempotentMethod(cfg.method);
        const canRetryMethod = config.retry.idempotentOnly ? idempotent : true;
        if (canRetryMethod && count < config.retry.maxRetries && shouldRetryByStatus(status, config)) {
          cfg._retryCount = count + 1;
          const delay = Math.min(config.retry.baseDelayMs * 2 ** count, config.retry.maxDelayMs);
          await sleep(delay);
          return instance(cfg);
        }
      }

      // ---- 归一化错误 ----
      const isTimeout = axiosError.code === 'ECONNABORTED' || /timeout/i.test(axiosError.message);
      const message = body
        ? (config.getMessage(body) ?? axiosError.message)
        : isTimeout
          ? '请求超时，请稍后重试'
          : axiosError.message || '网络异常';

      const kind: HttpError['kind'] = isTimeout ? 'timeout' : response ? 'status' : 'network';

      const httpError = new HttpError(message, {
        status,
        code,
        response,
        config: cfg,
        kind,
        cause: error,
      });

      reportError(httpError, cfg, config);
      throw httpError;
    },
  );
}

/**
 * 401 处理：刷新令牌 → 用新令牌重试原请求。
 * 已重试过、无 tokenManager、刷新失败都返回 null，让调用方走正常失败流程。
 */
const retryAfterRefresh = async (
  instance: AxiosInstance,
  cfg: InternalAxiosRequestConfig,
  config: ResolvedHttpClientConfig,
): Promise<AxiosResponse | null> => {
  const { tokenManager } = config;
  if (!tokenManager || cfg._authRetried) return null;

  cfg._authRetried = true;
  const newToken = await tokenManager.handleUnauthorized();
  if (!newToken) return null;

  // 清掉旧鉴权头，交给请求拦截器重新写入（重试会完整走一遍拦截器）
  removeHeader(cfg, config.authHeaderName);
  return instance(cfg);
};

/** 便于业务侧复用同一套判定 */
export const createCodeGetter = (order: Array<'errcode' | 'code'> = ['errcode', 'code']) => (body: HttpResult) => {
  const key = order.find((item) => body[item] !== undefined);
  return key ? body[key] : undefined;
};

export const createMessageGetter =
  (order: Array<'errmsg' | 'message' | 'msg'> = ['errmsg', 'message', 'msg']) =>
  (body: HttpResult): string | undefined => {
    const key = order.find((item) => typeof body[item] === 'string' && body[item]);
    return key ? (body[key] as string) : undefined;
  };
