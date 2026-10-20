/**
 * Vue 组合式封装：令牌刷新
 *
 * 逻辑只有一份 —— 在 `src/services/http/token-manager.ts`。
 * 这里只做两件事：把令牌包成响应式、把刷新状态映射成 Ref。
 *
 * 需要纯 TS 版本（API 层、拦截器里）请直接 import createTokenManager。
 */
import { ref, type Ref } from 'vue';

import { createTokenManager } from '@/services/http';
import type { TokenPair, TokenStorage } from '@/services/http';

export type { TokenPair, TokenStorage };

/** useTokenRefresh 配置项 */
export interface UseTokenRefreshOptions {
  /** 用 refreshToken 换新 token 对的 API（业务侧实现） */
  refreshApi: () => Promise<TokenPair>;
  /** 刷新彻底失败（如 refreshToken 也过期）时的回调，默认清空 token */
  onAuthFailed?: () => void;
  /** 自定义持久化（默认 localStorage） */
  storage?: TokenStorage;
  /** 初始化 token 读取（默认从 storage 读） */
  initTokens?: () => TokenPair | null;
  /** 判断某个错误是否属于 token 失效（默认 response.status === 401） */
  isUnauthorized?: (err: unknown) => boolean;
}

const EMPTY_TOKENS: TokenPair = { accessToken: '', refreshToken: '' };

const defaultIsUnauthorized = (err: unknown): boolean =>
  (err as { response?: { status?: number } } | undefined)?.response?.status === 401;

/**
 * 通用 token 刷新 hook（API 与原实现保持一致）
 *
 * ```ts
 * const token = useTokenRefresh({
 *   refreshApi: () => axios.post('/api/refresh-token', { refreshToken }).then((r) => r.data.data),
 *   onAuthFailed: () => { window.location.href = '/login'; },
 * });
 * ```
 */
export function useTokenRefresh(options: UseTokenRefreshOptions) {
  const { refreshApi, onAuthFailed, storage, initTokens, isUnauthorized = defaultIsUnauthorized } = options;

  // refreshApi 在 hook 里不带参数，适配成 manager 需要的签名
  const manager = createTokenManager({
    refreshApi: () => refreshApi(),
    onAuthFailed,
    storage,
  });

  const tokens = ref<TokenPair>(initTokens?.() ?? manager.getTokens() ?? EMPTY_TOKENS) as Ref<TokenPair>;
  const isRefreshing = ref(false);

  /** 把 manager 里的令牌同步到响应式 ref */
  const syncTokens = () => {
    tokens.value = manager.getTokens() ?? EMPTY_TOKENS;
  };

  /** 主动刷新，返回新的 accessToken；并发安全由 manager 保证 */
  const refresh = async (): Promise<string> => {
    isRefreshing.value = true;
    try {
      const accessToken = await manager.refresh();
      syncTokens();
      return accessToken;
    } finally {
      isRefreshing.value = false;
      syncTokens();
    }
  };

  /**
   * 业务捕获 401 时调用：不是 401 返回 null；刷新失败也返回 null（已触发 onAuthFailed）
   */
  const handleUnauthorized = async (err?: unknown): Promise<string | null> => {
    if (err !== undefined && !isUnauthorized(err)) return null;
    try {
      return await refresh();
    } catch {
      return null;
    }
  };

  /** 整体替换 token（登录成功后调用） */
  const setTokens = (pair: TokenPair) => {
    manager.setTokens(pair);
    syncTokens();
  };

  /** 仅更新 accessToken */
  const updateAccessToken = (accessToken: string) => {
    manager.updateAccessToken(accessToken);
    syncTokens();
  };

  /** 清空 token（登出时调用） */
  const clearTokens = () => {
    manager.clearTokens();
    syncTokens();
  };

  return {
    /** 当前 token 对（响应式） */
    tokens,
    /** 是否正在刷新 */
    isRefreshing,
    /** 主动刷新，返回新的 accessToken */
    refresh,
    /** 401 一键处理：内部刷新并返回新 token（失败返回 null） */
    handleUnauthorized,
    /** 整体设置 token（登录成功后） */
    setTokens,
    /** 仅更新 accessToken */
    updateAccessToken,
    /** 清空 token（登出） */
    clearTokens,
  };
}
