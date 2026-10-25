/**
 * 请求层类型定义
 *
 * 设计原则：不依赖 Vue / Pinia / Element Plus，纯 axios + TypeScript。
 * 复制到别的工程时，只需要看本文件顶部的 HttpClientConfig。
 */
import type { InternalAxiosRequestConfig } from 'axios';

/* ========================= 响应包体 ========================= */

/**
 * 后端统一响应包体。
 *
 * 各后端字段名不统一（errcode / code；errmsg / message / msg），
 * 这里全部声明为可选，由 getCode / getMessage 两个取值器适配。
 */
export interface HttpResult<T = unknown> {
  errcode?: string | number;
  errmsg?: string;
  code?: string | number;
  message?: string;
  msg?: string;
  success?: boolean;
  data: T;
  secretFields?: string[] | null;
}

/* ========================= 令牌 ========================= */

/** accessToken + refreshToken 一对 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** 令牌持久化抽象，默认实现基于 localStorage */
export interface TokenStorage {
  get: () => TokenPair | null;
  set: (tokens: TokenPair) => void;
  clear: () => void;
}

/** 令牌管理器：由 createTokenManager 创建，client 只依赖这个接口 */
export interface TokenManager {
  /** 当前 accessToken，无则返回空串 */
  getAccessToken: () => string;
  getTokens: () => TokenPair | null;
  setTokens: (pair: TokenPair) => void;
  /** refresh 接口只换了 accessToken 时用 */
  updateAccessToken: (accessToken: string) => void;
  clearTokens: () => void;
  /**
   * 刷新令牌。并发安全：同时多次调用只真正执行一次 refreshApi，
   * 其余调用共享同一个 Promise（成功一起成功，失败一起失败）。
   */
  refresh: () => Promise<string>;
  /** 401 时调用：刷新成功返回新 accessToken，失败返回 null（并已触发 onAuthFailed） */
  handleUnauthorized: () => Promise<string | null>;
  isRefreshing: () => boolean;
}

/* ========================= 配置 ========================= */

export type CodeGetter = (body: HttpResult) => string | number | undefined;
export type MessageGetter = (body: HttpResult) => string | undefined;

/** 401 / 令牌失效判定入参 */
export interface UnauthorizedContext {
  /** HTTP 状态码 */
  status?: number;
  /** 业务码 */
  code?: string | number;
  /** 原始请求配置 */
  config?: InternalAxiosRequestConfig;
  /** 响应体（可能是 blob 解析后的 JSON） */
  body?: HttpResult;
}

export interface RetryOptions {
  /** 最大重试次数，默认 2；0 表示关闭 */
  maxRetries?: number;
  /** 命中这些状态码才重试，默认 [408, 429, 500, 502, 503, 504] */
  retryStatuses?: number[];
  /** 退避基数（毫秒），第 n 次重试等待 baseDelayMs * 2^(n-1)，默认 300 */
  baseDelayMs?: number;
  /** 单次退避上限，默认 3000 */
  maxDelayMs?: number;
  /** 只重试幂等方法（GET / HEAD / OPTIONS），默认 true */
  idempotentOnly?: boolean;
}

/**
 * 请求层配置。所有字段都可缺省，缺省行为见注释。
 */
export interface HttpClientConfig {
  /** 接口前缀，默认取 /api */
  baseURL?: string;
  /** 超时（毫秒），默认 60000 */
  timeout?: number;
  /** 业务码取值器，默认优先 errcode 再 code */
  getCode?: CodeGetter;
  /** 业务消息取值器，默认优先 errmsg 再 message 再 msg */
  getMessage?: MessageGetter;
  /** 视为成功的业务码，默认 ['0', 0, 200, '200', true] */
  successCodes?: Array<string | number | boolean>;
  /** 每个请求动态追加的请求头（租户、终端、语言…），支持异步 */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  /** 鉴权头名，默认 'Authorization' */
  authHeaderName?: string;
  /** 鉴权头值前缀，默认为 'Bearer '；传空串则不加前缀 */
  authHeaderPrefix?: string;
  /** trace 请求头名，默认 'x-trace-id'；传 false 关闭 */
  traceHeaderName?: string | false;
  /** 统一错误提示回调（弹 toast / 上报） */
  onError?: (error: unknown) => void;
  /** 401 判定，默认 status === 401 或业务码命中 unauthorizedCodes */
  isUnauthorized?: (ctx: UnauthorizedContext) => boolean;
  /** 业务层视为「未登录」的码，默认 ['401', 401, '46010001'] */
  unauthorizedCodes?: Array<string | number>;
  /** 令牌管理器；不传则不做 401 自动刷新 */
  tokenManager?: TokenManager;
  /** 失败自动重试（默认关闭） */
  retry?: RetryOptions;
  /** 并发去重：相同 key 的 GET 同时只发一次，默认关闭 */
  dedupe?: boolean;
  /** 是否把响应体里的 data 解包后返回，默认 true */
  unwrapData?: boolean;
}

/** 归一化后的完整配置（内部使用） */
export type ResolvedHttpClientConfig = Required<
  Omit<HttpClientConfig, 'tokenManager' | 'retry' | 'getHeaders'>
> & {
  getHeaders?: HttpClientConfig['getHeaders'];
  tokenManager?: TokenManager;
  retry: Required<RetryOptions> & { enabled: boolean };
};

/* ========================= axios 扩展字段 ========================= */

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 跳过鉴权头注入与 401 自动刷新（登录、刷新令牌接口用） */
    skipAuth?: boolean;
    /** 跳过 onError 统一提示，由业务自行处理 */
    skipErrorHandler?: boolean;
    /** 内部：当前请求已重试次数 */
    retryCount?: number;
    /** 内部：本次请求是否已因 401 刷新重试过（只重试一次） */
    authRetried?: boolean;
    /** 内部：本次请求的 traceId */
    traceId?: string;
    /** 内部：并发去重的 key */
    _dedupeKey?: string;
  }
}
