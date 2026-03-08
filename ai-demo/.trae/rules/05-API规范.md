---
alwaysApply: false
description: API接口规范，包括TypeScript类型定义、接口文件组织、请求响应拦截处理。当创建API接口或处理HTTP请求时读取此规则。
---

# API规范

## TypeScript类型定义

- 所有API接口必须使用TypeScript定义类型
- 公共类型定义放在 `src/apis/types.ts`
- 业务相关类型定义放在对应的业务文件夹内
- 接口请求参数和响应数据必须有明确的类型定义

## 文件组织

```
src/apis/
├── types.ts             # 公共类型定义
├── index.ts             # API统一导出
├── request.ts           # Axios封装和拦截器
├── user/
│   ├── index.ts         # 类型定义
│   └── index.api.ts     # API接口函数
└── product/
    ├── index.ts         # 类型定义
    └── index.api.ts     # API接口函数
```

## API文件结构

### 类型定义文件 (index.ts)

```typescript
// src/apis/user/index.ts

export interface UserInfo {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
}
```

### API接口文件 (index.api.ts)

```typescript
// src/apis/user/index.api.ts
import request from '@/apis/request'
import type { LoginParams, LoginResponse, UserInfo } from './index'

export const login = (params: LoginParams): Promise<LoginResponse> => {
  return request.post('/api/login', params)
}

export const getUserInfo = (): Promise<UserInfo> => {
  return request.get('/api/user/info')
}
```

## Axios封装规范

- 统一使用封装的request实例，不直接使用axios
- 请求拦截器处理token、loading等
- 响应拦截器统一处理错误码
- 支持请求取消和重试机制

## 接口命名规范

- 使用camelCase命名
- 语义化命名，清晰表达功能
- CRUD操作使用标准命名：
  - 查询：`getXxxList`、`getXxxDetail`
  - 创建：`createXxx`、`addXxx`
  - 更新：`updateXxx`、`editXxx`
  - 删除：`deleteXxx`、`removeXxx`

## 错误处理

- 统一的错误码处理
- 业务错误在组件内处理
- 网络错误统一提示
- 支持自定义错误处理
