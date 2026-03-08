---
name: create-api
description: 指导创建符合规范的API接口，包括TypeScript类型定义、接口文件组织、请求响应拦截处理。当需要创建新的API接口时使用本技能。
---

# 创建API接口

## 使用场景

当你需要：

- 创建新的API接口
- 定义接口的TypeScript类型
- 添加请求/响应拦截器
- 创建业务模块的API

请使用本技能，并同时遵守 `.agents/rules/05-API规范.md`。

---

## API文件结构

### 1. 创建业务模块目录

```
src/apis/user/
├── index.ts      # 类型定义
└── index.api.ts  # API接口函数
```

### 2. 类型定义文件 (index.ts)

```typescript
// src/apis/user/index.ts

export interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  refreshToken: string
  userInfo: UserInfo
  expiresIn: number
}

export interface UpdateUserParams {
  name?: string
  email?: string
  avatar?: string
}
```

### 3. API接口文件 (index.api.ts)

```typescript
// src/apis/user/index.api.ts
import request from '@/apis/request'
import type { LoginParams, LoginResponse, UserInfo, UpdateUserParams } from './index'

/**
 * 用户登录
 */
export const login = (params: LoginParams): Promise<LoginResponse> => {

/**
 * 用户登录
 */
export const login = (params: LoginParams): Promise<LoginResponse> => {
  return request.post('/api/auth/login', params)
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): Promise<UserInfo> => {
  return request.get('/api/user/info')
}

/**
 * 更新用户信息
 */
export const updateUser = (params: UpdateUserParams): Promise<UserInfo> => {
  return request.put('/api/user/info', params)
}

/**
 * 用户登出
 */
export const logout = (): Promise<void> => {
  return request.post('/api/auth/logout')
}
```

### 4. 在API主入口导出

```typescript
// src/apis/index.ts
export * from './user/index.api'
export type * from './user/index'
```

---

## Axios封装示例

### request.ts

```typescript
// src/apis/request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from '@tiansu/element-plus'
import { useUserStore } from '@/store/user'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, code, message } = response.data

    if (code === 0) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    const { response } = error

    if (response) {
      const { status, data } = response

      switch (status) {
        case 401:
          // token过期，跳转到登录
          const userStore = useUserStore()
          userStore.logout()
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default request
```

---

## 快速检查清单

- [ ] 是否创建了对应的业务模块目录？
- [ ] 类型定义文件是否完整定义了所有接口参数和响应？
- [ ] API接口函数是否使用了正确的HTTP方法？
- [ ] 是否添加了必要的注释说明？
- [ ] 是否在API主入口正确导出？
- [ ] 是否使用了封装的request实例？
- [ ] 错误处理是否完善？
- [ ] 是否遵循了camelCase命名规范？
