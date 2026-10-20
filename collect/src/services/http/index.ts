/**
 * 请求层统一出口
 *
 * 复制到新工程时，整个 `services/http/` 目录直接拷走即可，
 * 只依赖 `axios`，不依赖 Vue / Pinia / Element Plus。
 *
 * 最小用法：
 * ```ts
 * import { createHttpClient, createTokenManager, getErrorMessage } from '@/services/http';
 *
 * const tokenManager = createTokenManager({
 *   refreshApi: async (refreshToken) => {
 *     const { data } = await axios.post('/api/refresh', { refreshToken });
 *     return { accessToken: data.accessToken, refreshToken: data.refreshToken };
 *   },
 *   onAuthFailed: () => router.replace('/login'),
 * });
 *
 * export const http = createHttpClient({
 *   baseURL: import.meta.env.VITE_BASE_URL,
 *   timeout: Number(import.meta.env.VITE_TIME_OUT) || 60000,
 *   tokenManager,
 *   getHeaders: () => ({ tenantCode: tenant.value }),
 *   onError: (err) => ElMessage.error(getErrorMessage(err)),
 * });
 * ```
 */
export { createHttpClient } from './client';
export type { DownloadResult, HttpClient } from './client';

export { createTokenManager, createTokenStorage, DEFAULT_TOKEN_KEYS } from './token-manager';
export type { TokenManagerOptions } from './token-manager';

export { BizError, HttpError, getErrorCode, getErrorMessage, isBizError, isCanceled, isHttpError } from './errors';

export { createCodeGetter, createMessageGetter, createTraceId, installInterceptors } from './interceptors';

export type {
  CodeGetter,
  HttpClientConfig,
  HttpResult,
  MessageGetter,
  RetryOptions,
  TokenManager,
  TokenPair,
  TokenStorage,
  UnauthorizedContext,
} from './types';
