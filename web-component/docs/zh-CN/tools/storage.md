---
title: storage
lang: zh-CN
---

### 导入

```typescript
import { createStorage, USER_TOKEN_KEY, TENANT_INFO_KEY } from "@tiansu/tools";
```

### 创建 storage

```typescript
createStorage(type, ns);
```

#### 参数

1. params ('localStorage' | 'sessionStorage'): storage 类型
2. params (string): 命名空间 默认:"TS"。

#### 返回

(StorageCus): storage 实例对象。**_ps：实例方法与原生 storage 保持一致_**

#### 例子

```typescript
const LocalStorage = createStorage("localStorage", "TS");
const SessionStorage = createStorage("sessionStorage", "TS");
```

#### 场景案例，获取平台 token

```typescript
const LocalStorage = createStorage("localStorage", "TS");
const userToken = LocalStorage.getItem(USER_TOKEN_KEY); //获取token
const tenantInfo = LocalStorage.getItem(TENANT_INFO_KEY); //获取租户信息
```
