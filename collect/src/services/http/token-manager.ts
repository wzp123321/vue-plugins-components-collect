/**
 * 令牌管理器
 *
 * 关键设计（也是这类代码最容易写错的地方）：
 *  1. 单飞（single-flight）：用「共享同一个 Promise」实现并发安全，而不是
 *     `isRefreshing` 布尔 + 等待队列。后者在刷新失败时容易只清空队列却不 reject
 *     等待者，导致那些请求永远挂着（内存泄漏 + 页面无响应）。
 *  2. 刷新超时：refreshApi 卡住时不能让所有请求排队等死，超时即失败。
 *  3. 失败只通知一次：连续多个 401 共享同一次失败，onAuthFailed 只触发一次，
 *     不会连弹 5 个「登录已失效」。
 *  4. 不依赖 Vue：refreshApi 由调用方注入，刷新接口本身请用裸 axios 或
 *     `skipAuth: true` 发出，避免递归进拦截器。
 */
import type { TokenPair, TokenManager, TokenStorage } from './types';

/** localStorage 默认键名 */
export const DEFAULT_TOKEN_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;

/** 默认持久化：localStorage */
export const createTokenStorage = (
  keys: { accessToken: string; refreshToken: string } = DEFAULT_TOKEN_KEYS,
): TokenStorage => ({
  get: () => {
    const accessToken = localStorage.getItem(keys.accessToken) ?? '';
    const refreshToken = localStorage.getItem(keys.refreshToken) ?? '';
    return accessToken || refreshToken ? { accessToken, refreshToken } : null;
  },
  set: ({ accessToken, refreshToken }) => {
    localStorage.setItem(keys.accessToken, accessToken);
    localStorage.setItem(keys.refreshToken, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(keys.accessToken);
    localStorage.removeItem(keys.refreshToken);
  },
});

export interface TokenManagerOptions {
  /** 用 refreshToken 换新令牌对的接口实现（业务侧提供） */
  refreshApi: (refreshToken: string) => Promise<TokenPair>;
  /** 自定义持久化，默认 localStorage */
  storage?: TokenStorage;
  /** 刷新彻底失败（refreshToken 也过期）时的回调 */
  onAuthFailed?: () => void;
  /** 刷新超时（毫秒），默认 15000 */
  refreshTimeout?: number;
}

/** 给 Promise 加超时，超时后 reject；计时器一定会被清理 */
const withTimeout = <T>(task: Promise<T>, timeoutMs: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });

export const createTokenManager = (options: TokenManagerOptions): TokenManager => {
  const { refreshApi, storage = createTokenStorage(), onAuthFailed, refreshTimeout = 15000 } = options;

  let tokens: TokenPair | null = storage.get();
  /** 进行中的刷新任务：并发调用共享它 */
  let inflight: Promise<string> | null = null;
  /** 本次「失效周期」是否已通知过，避免重复弹窗 */
  let authFailedNotified = false;

  const notifyAuthFailed = () => {
    if (authFailedNotified) return;
    authFailedNotified = true;
    onAuthFailed?.();
  };

  const setTokens = (pair: TokenPair) => {
    tokens = pair;
    authFailedNotified = false;
    storage.set(pair);
  };

  const updateAccessToken = (accessToken: string) => {
    if (!tokens) return;
    tokens = { ...tokens, accessToken };
    storage.set(tokens);
  };

  const clearTokens = () => {
    tokens = null;
    storage.clear();
  };

  const runRefresh = async (refreshToken: string): Promise<string> => {
    try {
      const pair = await withTimeout(refreshApi(refreshToken), refreshTimeout, '刷新令牌超时');
      if (!pair?.accessToken) throw new Error('刷新令牌返回空 accessToken');
      setTokens(pair);
      return pair.accessToken;
    } catch (err) {
      // 刷新失败 = 会话终结，清干净并通知一次
      clearTokens();
      notifyAuthFailed();
      throw err;
    }
  };

  const refresh = (): Promise<string> => {
    if (inflight) return inflight;

    if (!tokens?.refreshToken) {
      notifyAuthFailed();
      return Promise.reject(new Error('无可用的 refreshToken'));
    }

    const task = runRefresh(tokens.refreshToken);
    inflight = task;
    // 独立分支消费拒绝，避免 unhandled rejection；不影响 task 本身的拒绝语义
    task.catch(() => undefined).finally(() => {
      if (inflight === task) inflight = null;
    });
    return task;
  };

  const handleUnauthorized = async (): Promise<string | null> => {
    try {
      return await refresh();
    } catch {
      return null;
    }
  };

  return {
    getAccessToken: () => tokens?.accessToken ?? '',
    getTokens: () => tokens,
    setTokens,
    updateAccessToken,
    clearTokens,
    refresh,
    handleUnauthorized,
    isRefreshing: () => inflight !== null,
  };
}
