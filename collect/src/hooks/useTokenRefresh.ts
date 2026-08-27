import { ref, type Ref } from 'vue';

/** accessToken + refreshToken 一对 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** token 持久化抽象，默认基于 localStorage */
export interface TokenStorage {
  get: () => TokenPair | null;
  set: (tokens: TokenPair) => void;
  clear: () => void;
}

/** useTokenRefresh 配置项 */
export interface UseTokenRefreshOptions {
  /** 用 refreshToken 换新 token 对的 API（业务侧实现） */
  refreshApi: () => Promise<TokenPair>;
  /** 刷新彻底失败（如 refreshToken 也过期）时的回调，默认清空 token + console.warn */
  onAuthFailed?: () => void;
  /** 自定义持久化（默认 localStorage） */
  storage?: TokenStorage;
  /** 初始化 token 读取（默认从 storage 读） */
  initTokens?: () => TokenPair | null;
  /** 判断某个错误是否属于 token 失效（默认 response.status === 401） */
  isUnauthorized?: (err: any) => boolean;
}

/** 默认 localStorage 实现 */
const defaultStorage: TokenStorage = {
  get: () => {
    const at = localStorage.getItem('accessToken');
    const rt = localStorage.getItem('refreshToken');
    return at && rt ? { accessToken: at, refreshToken: rt } : null;
  },
  set: ({ accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

const defaultIsUnauthorized = (err: any) => err?.response?.status === 401;

/**
 * 通用 token 刷新 hook
 *
 * 能力：
 *  - 管理 accessToken / refreshToken 状态（含持久化）
 *  - 主动 refresh()：并发安全（同时多个调用只触发 1 次 refreshApi）
 *  - 等待队列：先到的请求触发刷新，后到的请求挂起等结果
 *  - handleUnauthorized(err)：业务捕获 401 时一键处理（自动刷新 + 返回新 token）
 *  - 刷新失败自动清空 + 触发 onAuthFailed
 *
 * 用法：
 * ```ts
 * const token = useTokenRefresh({
 *   refreshApi: () => axios.post('/api/refresh-token', { refreshToken: ... }).then(r => r.data.data),
 *   onAuthFailed: () => { window.location.href = '/login' },
 * });
 * ```
 */
export function useTokenRefresh(options: UseTokenRefreshOptions) {
  const {
    refreshApi,
    onAuthFailed,
    storage = defaultStorage,
    initTokens = () => storage.get(),
    isUnauthorized = defaultIsUnauthorized,
  } = options;

  const tokens = ref<TokenPair>(initTokens() ?? { accessToken: '', refreshToken: '' }) as Ref<TokenPair>;
  const isRefreshing = ref(false);
  // 等待本次刷新完成的回调队列
  let pendingQueue: Array<(token: string) => void> = [];

  /** 整体替换 token（外部登录成功时调用） */
  const setTokens = (pair: TokenPair) => {
    tokens.value = pair;
    storage.set(pair);
  };

  /** 仅更新 accessToken（refresh 接口只换了 accessToken 的场景） */
  const updateAccessToken = (accessToken: string) => {
    tokens.value = { ...tokens.value, accessToken };
    storage.set(tokens.value);
  };

  /** 清空 token（登出时调用） */
  const clearTokens = () => {
    tokens.value = { accessToken: '', refreshToken: '' };
    storage.clear();
  };

  /** 通知所有等待的回调：刷新完成 */
  const notifyRefreshed = (newAccessToken: string) => {
    pendingQueue.forEach((cb) => cb(newAccessToken));
    pendingQueue = [];
  };

  /**
   * 主动刷新 token。
   * 并发安全：多个 await refresh() 同时调用，只会真正触发 1 次 refreshApi，
   * 后续的 await 会等待前一次刷新完成拿到新 accessToken。
   */
  const refresh = (): Promise<string> => {
    // 已经有别的调用在刷新中 → 排队等待
    if (isRefreshing.value) {
      return new Promise<string>((resolve) => {
        pendingQueue.push((newToken) => resolve(newToken));
      });
    }
    isRefreshing.value = true;
    return refreshApi()
      .then((newPair) => {
        setTokens(newPair);
        notifyRefreshed(newPair.accessToken);
        return newPair.accessToken;
      })
      .catch((err) => {
        // refreshApi 失败：清掉所有等待的回调 + 触发登录跳转
        pendingQueue = [];
        clearTokens();
        onAuthFailed?.();
        throw err;
      })
      .finally(() => {
        isRefreshing.value = false;
      });
  };

  /**
   * 业务侧捕获 401 时调用：自动刷新 token 并返回新的 accessToken。
   *  - 错误不是 401：直接返回 null（不处理）
   *  - 刷新成功：返回新的 accessToken
   *  - 刷新失败：返回 null（已触发 onAuthFailed）
   */
  const handleUnauthorized = async (err: any): Promise<string | null> => {
    if (!isUnauthorized(err)) return null;
    try {
      return await refresh();
    } catch {
      return null;
    }
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
