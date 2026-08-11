/**
 * axios-demo 各场景的代码示例（字符串）
 * 抽出到独立文件，让主页面和子组件只关心交互与展示
 */
export const basicCode = `// utils/request.ts
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
})

// 请求拦截：注入 token
instance.interceptors.request.use(config => {
  config.headers['Authorization'] = getToken()
  return config
})

// 响应拦截：统一处理错误
instance.interceptors.response.use(
  res => res.data,   // 直接返回 data
  err => {
    if (err.response?.status === 401) logout()
    return Promise.reject(err)
  }
)`;

export const cancelCode = `// 使用 AbortController 取消请求
const controller = new AbortController()

axios.get('/api/data', {
  signal: controller.signal
})

// 取消
controller.abort()

// 判断是否是取消
if (axios.isCancel(error)) {
  console.log('请求已取消')
}`;

export const retryCode = `// 请求重试工具函数
const retryRequest = async (
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000
) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i < retries) {
        await sleep(delay * Math.pow(2, i))  // 指数退避
      } else {
        throw err
      }
    }
  }
}`;

export const concurrentCode = `// 并发控制：限制最大同时请求数
const concurrentLimit = async (
  tasks: (() => Promise<any>)[],
  limit: number
) => {
  let index = 0
  const runNext = async () => {
    if (index >= tasks.length) return
    const i = index++
    await tasks[i]()
    await runNext()  // 完成后立即拉取下一个
  }
  // 同时启动 limit 个 worker
  await Promise.all(
    Array(limit).fill(null).map(runNext)
  )
}`;

export const tokenRefreshCode = `// ✅ 推荐：直接复用 \`useTokenRefresh\` + \`createAuthInterceptor\` 这两个 hook
//    其他模块直接 import 即可，无需自己写并发控制
import axios from 'axios'
import { useTokenRefresh, createAuthInterceptor } from '@/hooks'

// ===== 1. 业务模块：声明 token 刷新规则 =====
const tokenManager = useTokenRefresh({
  // 用 refreshToken 换新 accessToken（业务侧 API）
  refreshApi: () =>
    axios
      .post('/api/refresh-token', { refreshToken: tokenManager.tokens.value.refreshToken })
      .then((r) => r.data.data), // { accessToken, refreshToken }
  // 刷新彻底失败（refreshToken 也过期）→ 跳登录
  onAuthFailed: () => {
    localStorage.clear()
    window.location.href = '/login'
  },
})

// ===== 2. 创建一个带自动刷新 token 的 axios 实例 =====
const http = axios.create({ baseURL: '/api', timeout: 10000 })

createAuthInterceptor(http, {
  getAccessToken: () => tokenManager.tokens.value.accessToken,
  handleUnauthorized: tokenManager.handleUnauthorized,
  // 避免 refresh 接口本身 401 时死循环
  isRefreshRequest: (config) => !!config.url?.includes('/refresh-token'),
})

// ===== 3. 业务代码：像用普通 axios 一样用 =====
http.get('/user/info')  // 401 时自动刷新 token 并重试，无需业务感知
http.post('/order/create', data)

// ===== 附：useTokenRefresh 暴露的能力 =====
// {
//   tokens: Ref<{ accessToken, refreshToken }>,  // 响应式 token 状态
//   isRefreshing: Ref<boolean>,                   // 是否正在刷新
//   refresh(): Promise<string>,                   // 主动刷新，返回新 accessToken
//   handleUnauthorized(err): Promise<string|null>,// 捕获 401 时调用，自动刷新并返回新 token
//   setTokens({ accessToken, refreshToken }),     // 登录成功后整体写入
//   updateAccessToken(accessToken),               // 仅替换 accessToken
//   clearTokens(),                                // 登出时清空
// }`;

export const fullRequestCode = `// 完整封装思路（推荐参考）
class RequestManager {
  private instance = axios.create({ baseURL, timeout: 10000 })
  private pendingMap = new Map<string, AbortController>()

  // 生成请求唯一 key
  private getKey(config: AxiosRequestConfig) {
    return \`\${config.method}-\${config.url}-\${JSON.stringify(config.params)}\`
  }

  // 取消重复请求
  cancelDuplicate(config: AxiosRequestConfig) {
    const key = this.getKey(config)
    if (this.pendingMap.has(key)) {
      this.pendingMap.get(key)!.abort()
    }
    const controller = new AbortController()
    config.signal = controller.signal
    this.pendingMap.set(key, controller)
  }

  // 请求完成后移除
  removePending(config: AxiosRequestConfig) {
    this.pendingMap.delete(this.getKey(config))
  }
}`;
