/**
 * 错误归一化
 *
 * 约定：
 *  - HttpError  ：HTTP 层失败（状态码非 2xx、网络中断、超时、主动取消）
 *  - BizError   ：HTTP 200 但业务码不成功
 *  - isCanceled ：主动取消（不应弹错误提示）
 *
 * 两者都保留原始 config / body，业务侧取错误码不需要再翻 response。
 */
import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import type { HttpResult } from './types';

/** HTTP 层错误 */
export class HttpError extends Error {
  /** HTTP 状态码；网络中断 / 超时为 undefined */
  readonly status?: number;

  /** 业务码（若响应体里带） */
  readonly code?: string | number;

  /** 原始响应 */
  readonly response?: AxiosResponse;

  /** 原始请求配置 */
  readonly config?: InternalAxiosRequestConfig;

  /** 错误类型，便于业务分支处理 */
  readonly kind: 'network' | 'timeout' | 'canceled' | 'status';

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string | number;
      response?: AxiosResponse;
      config?: InternalAxiosRequestConfig;
      kind?: HttpError['kind'];
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = options.status;
    this.code = options.code;
    this.response = options.response;
    this.config = options.config;
    this.kind = options.kind ?? 'status';
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/** 业务错误：HTTP 200，业务码不成功 */
export class BizError extends Error {
  readonly code?: string | number;

  /** 完整响应体，业务侧可读 data / secretFields */
  readonly body?: HttpResult;

  readonly config?: InternalAxiosRequestConfig;

  constructor(
    message: string,
    options: {
      code?: string | number;
      body?: HttpResult;
      config?: InternalAxiosRequestConfig;
    } = {},
  ) {
    super(message);
    this.name = 'BizError';
    this.code = options.code;
    this.body = options.body;
    this.config = options.config;
  }
}

export const isHttpError = (err: unknown): err is HttpError => err instanceof HttpError;

export const isBizError = (err: unknown): err is BizError => err instanceof BizError;

/** 主动取消：不应弹错误提示，也不应重试 */
export const isCanceled = (err: unknown): boolean => axios.isCancel(err) || (isHttpError(err) && err.kind === 'canceled');

/** 取错误消息，兼容三类错误与普通 Error */
export const getErrorMessage = (err: unknown, fallback = '请求失败'): string => {
  if (isHttpError(err) || isBizError(err)) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string' && err) return err;
  return fallback;
};

/** 取错误业务码，兼容 HttpError / BizError */
export const getErrorCode = (err: unknown): string | number | undefined => {
  if (isHttpError(err) || isBizError(err)) return err.code;
  return undefined;
};
