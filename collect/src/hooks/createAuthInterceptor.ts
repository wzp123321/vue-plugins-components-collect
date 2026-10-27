import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/** createAuthInterceptor 配置项 */
export interface AuthInterceptorOptions {
  /** 获取当前 accessToken（一般是 tokenManager.tokens.value.accessToken） */
  getAccessToken: () => string;
  /** 处理 401：刷新并返回新 token；失败返回 null */
  handleUnauthorized: (err: any) => Promise<string | null>;
  /** 判定某个请求是否是 refresh 接口本身（避免 401 死循环） */
  isRefreshRequest?: (config: InternalAxiosRequestConfig) => boolean;
  /** 响应成功转换（默认直接返回 res.data） */
  transformResponse?: <T = any>(res: AxiosResponse<T>) => any;
}

/**
 * 给 axios 实例安装 token 自动注入 + 401 自动刷新重试的拦截器。
 *
 * 适用场景：你有一个**已存在**的 axios 实例（第三方 SDK、旧代码），只想加鉴权与重试。
 * 新代码请直接用 `src/services/http` 的 createHttpClient —— 那套已内置同样的能力，
 * 并且额外提供业务码判定、blob 错误还原、并发去重。
 *
 * 通常与 useTokenRefresh 配合使用：
 * ```ts
 * const token = useTokenRefresh({ refreshApi, onAuthFailed });
 * const http = axios.create({ baseURL: '/api' });
 * createAuthInterceptor(http, {
 *   getAccessToken: () => token.tokens.value.accessToken,
 *   handleUnauthorized: token.handleUnauthorized,
 *   isRefreshRequest: cfg => !!cfg.url?.includes('/refresh-token'),
 * });
 * ```
 */
export const createAuthInterceptor = (axiosInstance: AxiosInstance, options: AuthInterceptorOptions) => {
  const { getAccessToken, handleUnauthorized, isRefreshRequest, transformResponse } = options;

  // ===== 请求拦截：自动注入 Authorization =====
  axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  // ===== 响应拦截：401 → 刷新 token → 用新 token 重试原请求 =====
  axiosInstance.interceptors.response.use(
    (res) => (transformResponse ? transformResponse(res) : res.data),
    async (err) => {
      const { response, config } = err;
      // 1. 非 401：原样抛出
      if (response?.status !== 401) return Promise.reject(err);
      // 2. refresh 接口本身也 401（说明 refreshToken 也过期了）：不重试，交给 onAuthFailed
      if (isRefreshRequest?.(config)) return Promise.reject(err);

      // 3. 尝试刷新 token（内部已处理并发安全）
      const newToken = await handleUnauthorized(err);
      if (!newToken) return Promise.reject(err);

      // 4. 用新 token 重试原请求
      config.headers.set('Authorization', `Bearer ${newToken}`);
      return axiosInstance(config);
    },
  );
}
