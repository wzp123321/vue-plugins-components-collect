# services/http — 可复制的请求层模板

一套完整、零框架耦合的 axios 请求层：请求/响应拦截、业务码判定、blob 错误还原、401 自动刷新重试、网络重试、并发去重。

**只依赖 `axios`**，不含 Vue / Pinia / Element Plus。要复用到别的工程，把整个 `http/` 目录拷过去即可。

---

## 目录

| 文件 | 职责 |
| --- | --- |
| `types.ts` | 全部类型：`HttpClientConfig`、`HttpResult`、`TokenPair`、axios 扩展字段 |
| `errors.ts` | `HttpError`（HTTP 层）/ `BizError`（业务层）/ 判定与取值函数 |
| `token-manager.ts` | 令牌存取 + 单飞刷新（single-flight）+ 刷新超时 + 失败只通知一次 |
| `interceptors.ts` | 请求头注入、业务码判定、blob 错误还原、401 重试、指数退避重试 |
| `client.ts` | `createHttpClient()`：组装实例，暴露 `get/post/put/patch/delete/download/upload` |

依赖方向严格单向：`client → interceptors → errors/token-manager → types`，无循环。

---

## 三步接入

### 1. 建一个 tokenManager

```ts
import { createTokenManager } from '@/services/http';

export const tokenManager = createTokenManager({
  // 刷新接口请用裸 axios（或 skipAuth: true），否则会递归进拦截器
  refreshApi: async (refreshToken) => {
    const { data } = await axios.post('/api/refresh', { refreshToken });
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  },
  onAuthFailed: () => {
    tokenManager.clearTokens();
    window.location.href = '/login';
  },
});
```

令牌默认存 `localStorage` 的 `accessToken` / `refreshToken`。要换键名或换存储介质，传 `storage`（实现 `TokenStorage` 三个方法即可）。

### 2. 建 client

```ts
import { createHttpClient, getErrorMessage } from '@/services/http';

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: Number(import.meta.env.VITE_TIME_OUT) || 60000,
  tokenManager,
  // 每个请求动态追加（租户、终端、语言…），支持 async
  getHeaders: () => ({ tenantCode: getTenantCode() }),
  onError: (err) => ElMessage.error(getErrorMessage(err)),
});
```

### 3. 直接用

```ts
const list = await http.get<DatasetVO[]>('/dataset/list', { params: { page: 1 } });
const detail = await http.post<DatasetVO>('/dataset/detail', { id });
const full = await http.requestFull<DatasetVO>('/dataset/detail', { data: { id } }); // 需要 errcode
const { blob, filename } = await http.download('/report/export', { params: { id } });
```

`get/post/...` 默认返回解包后的 `data`；要完整包体用 `requestFull`。

---

## 这套实现要解决什么

### 1. 业务码与 HTTP 码分离

HTTP 200 不代表成功。拦截器读 `errcode`（或 `code`）判定，失败抛 `BizError`，业务侧：

```ts
try {
  await http.post('/x', body);
} catch (err) {
  if (isBizError(err)) {
    // err.code 业务码，err.body 完整响应体
  }
  if (isHttpError(err)) {
    // err.status 401/500，err.kind: 'status' | 'timeout' | 'network' | 'canceled'
  }
}
```

### 2. 并发 401 只刷新一次，且失败不会挂死请求

用**共享同一个 Promise** 做单飞，而不是「布尔标记 + 等待队列」。后者最典型的 bug 是：刷新失败时只清空队列、不 reject 等待者，那些请求永远 pending —— 页面表现为一直转圈。

```ts
if (inflight) return inflight;   // 并发调用共享同一个任务
```

失败时所有等待者收到同一个 rejection；`onAuthFailed` 通过 `authFailedNotified` 保证只弹一次。

### 3. blob 下载的「200 + JSON 错误体」

后端统一异常处理会让下载接口返回 `200 + {"errcode":"...","errmsg":"..."}`，`responseType: 'blob'` 时它是个 `Blob`（type 为 `application/json`）。旧写法用 `FileReader` 异步读，检查完响应已经交给业务了，等于没检查。

这里在拦截器里 `await blob.text()` 解析完再决定放行还是抛错：

```ts
if (data instanceof Blob) {
  if (!/json/i.test(data.type)) return undefined;  // 真文件流
  return JSON.parse(await data.text());
}
```

### 4. 跳过鉴权与重试标记

- `skipAuth: true`：登录、刷新令牌接口用，不注入头、不做 401 重试
- `skipErrorHandler: true`：业务自己处理提示
- `_authRetried`：401 只重试一次，防死循环
- `_retryCount`：网络重试计数

### 5. 重试只打幂等方法

`retry.idempotentOnly` 默认 `true`，只重试 `GET/HEAD/OPTIONS`。POST 被重试可能产生重复数据。

---

## 配置速查

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `baseURL` | `/api` | 接口前缀 |
| `timeout` | `60000` | 毫秒 |
| `getCode` | `errcode` → `code` | 业务码取值器 |
| `getMessage` | `errmsg` → `message` → `msg` | 消息取值器 |
| `successCodes` | `['0', 0, 200, '200', true]` | 成功码集合 |
| `authHeaderName` | `Authorization` | 改成 `ts-token` 之类即可适配 |
| `authHeaderPrefix` | `'Bearer '` | 传 `''` 则原样输出 |
| `traceHeaderName` | `x-trace-id` | 传 `false` 关闭 |
| `isUnauthorized` | `status===401 \|\| 码命中 unauthorizedCodes` | 自定义失效判定 |
| `retry.maxRetries` | `0`（关闭） | 网络/5xx 重试次数 |
| `dedupe` | `false` | 相同 GET 并发合并 |
| `unwrapData` | `true` | 是否解包 `data` |

后端字段名不统一时，用现成的取值器工厂：

```ts
createHttpClient({
  getCode: createCodeGetter(['code', 'errcode']),   // 先看 code
  getMessage: createMessageGetter(['msg', 'message']),
  successCodes: [200, '200'],                        // 不认 '0'
});
```

---

## 不该这么做（都是踩过的坑）

| 反模式 | 后果 |
| --- | --- |
| `axios.interceptors.request.use(...)` 直接改全局 axios | 任何库内部的 axios 调用（SDK、图表、上传组件）都被套上你的 token 和 baseURL，且模块没人 import 时**完全不生效** |
| 用副作用模块注册拦截器（`import './request'` 只写在某个页面里） | 入口漏引一处，全站无鉴权，且不报错 |
| 刷新失败只清队列不 reject | 等待中的请求永久 pending |
| 401 重试不加标记 | 令牌一直失效 → 无限重试，把后端打满 |
| `timeout: import.meta.env.VITE_TIME_OUT as number` | env 是字符串，`as` 只是类型断言。用 `Number(...)` |
| 在拦截器里统一弹窗又给业务留了 catch | 一次失败弹两个提示，用 `skipErrorHandler` 分流 |

---

## 与 `src/hooks/useTokenRefresh.ts` 的关系

`hooks/useTokenRefresh.ts` 是同一套逻辑的 **Vue 组合式封装**（响应式 `tokens` / `isRefreshing`，给页面用），内部已改为委托给本目录的 `createTokenManager`，不再有第二份实现。

- 组件里要响应式读 token → 用 hook
- 纯 TS 模块、API 层 → 直接 `createTokenManager`
