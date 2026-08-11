<template>
  <div class="axios-demo-page">
    <h5>Axios 请求层封装演示</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      展示 Axios 请求封装的核心模式：请求/响应拦截、重试机制、请求取消、并发控制、上传进度。
    </el-alert>

    <el-row :gutter="16">
      <!-- 基础请求 -->
      <el-col :span="12">
        <el-card>
          <template #header>① 基础 GET/POST 请求</template>
          <div class="demo-section">
            <el-button type="primary" @click="doGet" :loading="getLoading">GET 请求</el-button>
            <el-button type="success" @click="doPost" :loading="postLoading">POST 请求</el-button>
            <div v-if="result1" class="result-box">{{ result1 }}</div>
          </div>
          <pre class="code-block">{{ basicCode }}</pre>
        </el-card>
      </el-col>

      <!-- 请求取消 -->
      <el-col :span="12">
        <el-card>
          <template #header>② AbortController 请求取消</template>
          <div class="demo-section">
            <el-button type="warning" @click="startLongReq" :disabled="reqRunning">发起长请求</el-button>
            <el-button type="danger" @click="cancelReq" :disabled="!reqRunning">取消请求</el-button>
            <div v-if="cancelStatus" class="result-box" :class="cancelStatus.type">{{ cancelStatus.msg }}</div>
          </div>
          <pre class="code-block">{{ cancelCode }}</pre>
        </el-card>
      </el-col>

      <!-- 重试机制 -->
      <el-col :span="12" style="margin-top: 16px">
        <el-card>
          <template #header>③ 请求重试（自动重试 3 次）</template>
          <div class="demo-section">
            <el-button type="primary" @click="doRetry" :loading="retryLoading">发起会失败的请求（自动重试）</el-button>
            <div class="retry-log">
              <div v-for="(log, i) in retryLogs" :key="i" :class="['log-line', log.type]">{{ log.msg }}</div>
            </div>
          </div>
          <pre class="code-block">{{ retryCode }}</pre>
        </el-card>
      </el-col>

      <!-- 并发控制 -->
      <el-col :span="12" style="margin-top: 16px">
        <el-card>
          <template #header>④ 并发控制（最多同时 3 个请求）</template>
          <div class="demo-section">
            <el-button type="primary" @click="doConcurrent" :loading="concurrentLoading">
              发起 8 个请求（限并发 3）
            </el-button>
            <div class="concurrent-grid">
              <div v-for="req in concurrentReqs" :key="req.id" class="req-item" :class="req.status">
                #{{ req.id }}
                {{
                  req.status === 'pending'
                    ? '等待中'
                    : req.status === 'running'
                      ? '请求中...'
                      : req.status === 'done'
                        ? '✅ 完成'
                        : '❌ 失败'
                }}
              </div>
            </div>
          </div>
          <pre class="code-block">{{ concurrentCode }}</pre>
        </el-card>
      </el-col>

      <!-- Token 失效自动刷新 -->
      <el-col :span="24" style="margin-top: 16px">
        <el-card>
          <template #header>⑤ Token 失效自动刷新 + 重试（并发安全）</template>
          <div class="demo-section">
            <div class="token-state">
              <div class="token-item">
                <span class="token-label">Access Token:</span>
                <el-tag :type="accessToken ? 'success' : 'info'" size="small">
                  {{ accessToken ? '...' + accessToken.slice(-8) : '未登录' }}
                </el-tag>
              </div>
              <div class="token-item">
                <span class="token-label">Refresh Token:</span>
                <el-tag :type="refreshToken ? 'warning' : 'info'" size="small">
                  {{ refreshToken ? '****' + refreshToken.slice(-4) : '无' }}
                </el-tag>
              </div>
              <el-button size="small" @click="resetTokens">重置</el-button>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap">
              <el-button type="primary" @click="doTokenRefresh" :loading="tokenRefreshLoading">
                ① 模拟 401 → 自动刷新 token → 重试
              </el-button>
              <el-button type="warning" @click="doMultipleTokenRefresh" :loading="multiTokenLoading">
                ② 并发 3 个请求（只刷新 1 次 token）
              </el-button>
              <el-button type="danger" @click="doRefreshTokenExpired" :loading="refreshExpiredLoading">
                ③ refreshToken 也失效 → 跳转登录
              </el-button>
            </div>
            <div class="token-log">
              <div v-for="(log, i) in tokenLogs" :key="i" :class="['log-line', log.type]">
                <span class="log-time">{{ log.time }}</span>
                {{ log.msg }}
              </div>
              <div v-if="!tokenLogs.length" class="log-empty">点击上方按钮查看完整流程</div>
            </div>
          </div>
          <pre class="code-block">{{ tokenRefreshCode }}</pre>
        </el-card>
      </el-col>

      <!-- 完整封装代码 -->
      <el-col :span="24" style="margin-top: 16px">
        <el-card>
          <template #header>⚙️ 完整 request.ts 封装思路</template>
          <pre class="code-block">{{ fullRequestCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';

defineOptions({ name: 'AxiosDemo' });

// ===== 基础请求 =====
const getLoading = ref(false);
const postLoading = ref(false);
const result1 = ref('');

const doGet = async () => {
  getLoading.value = true;
  try {
    // 使用公共测试API
    const res = await axios.get('https://jsonplaceholder.typicode.com/users/1', { timeout: 5000 });
    result1.value = `✅ GET 成功：${res.data.name} | ${res.data.email}`;
  } catch {
    result1.value = '❌ 请求失败（可能网络不通）';
  } finally {
    getLoading.value = false;
  }
};

const doPost = async () => {
  postLoading.value = true;
  try {
    const res = await axios.post(
      'https://jsonplaceholder.typicode.com/posts',
      { title: '测试', body: 'hello', userId: 1 },
      { timeout: 5000 },
    );
    result1.value = `✅ POST 成功：id=${res.data.id}, title="${res.data.title}"`;
  } catch {
    result1.value = '❌ 请求失败';
  } finally {
    postLoading.value = false;
  }
};

// ===== 请求取消 =====
const reqRunning = ref(false);
const cancelStatus = ref<{ type: string; msg: string } | null>(null);
let abortController: AbortController | null = null;

const startLongReq = async () => {
  reqRunning.value = true;
  cancelStatus.value = { type: 'running', msg: '⏳ 请求进行中（5秒超时）...' };
  abortController = new AbortController();
  try {
    await axios.get('https://jsonplaceholder.typicode.com/posts', {
      signal: abortController.signal,
      timeout: 5000,
    });
    cancelStatus.value = { type: 'success', msg: '✅ 请求完成！' };
  } catch (err: any) {
    if (axios.isCancel(err) || err.name === 'CanceledError') {
      cancelStatus.value = { type: 'warning', msg: '🛑 请求已被手动取消' };
    } else {
      cancelStatus.value = { type: 'error', msg: `❌ 请求出错：${err.message}` };
    }
  } finally {
    reqRunning.value = false;
  }
};

const cancelReq = () => {
  abortController?.abort();
};

// ===== 重试机制 =====
const retryLoading = ref(false);
const retryLogs = ref<{ type: string; msg: string }[]>([]);

const retryRequest = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i < retries) {
        retryLogs.value.push({ type: 'warning', msg: `⚠️ 第 ${i + 1} 次失败，${delay}ms 后重试...` });
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
};

const doRetry = async () => {
  retryLoading.value = true;
  retryLogs.value = [];
  let attempt = 0;
  try {
    await retryRequest(
      async () => {
        attempt++;
        retryLogs.value.push({ type: 'info', msg: `🔄 第 ${attempt} 次尝试...` });
        if (attempt < 3) throw new Error('模拟网络错误');
        // 第 3 次成功
        return { data: 'ok' };
      },
      3,
      500,
    );
    retryLogs.value.push({ type: 'success', msg: '✅ 最终成功！' });
  } catch {
    retryLogs.value.push({ type: 'error', msg: '❌ 重试耗尽，最终失败' });
  } finally {
    retryLoading.value = false;
  }
};

// ===== 并发控制 =====
const concurrentLoading = ref(false);
const concurrentReqs = ref<{ id: number; status: string }[]>([]);

const concurrentLimit = async (tasks: (() => Promise<any>)[], limit: number) => {
  const results: any[] = [];
  let index = 0;

  const runNext = async (): Promise<void> => {
    if (index >= tasks.length) return;
    const i = index++;
    concurrentReqs.value[i].status = 'running';
    try {
      results[i] = await tasks[i]();
      concurrentReqs.value[i].status = 'done';
    } catch {
      concurrentReqs.value[i].status = 'failed';
    }
    await runNext();
  };

  const workers = Array(Math.min(limit, tasks.length)).fill(null).map(runNext);
  await Promise.all(workers);
  return results;
};

const doConcurrent = async () => {
  concurrentLoading.value = true;
  concurrentReqs.value = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, status: 'pending' }));

  const tasks = Array.from({ length: 8 }, (_, i) => async () => {
    const delay = Math.random() * 1500 + 500;
    await new Promise((r) => setTimeout(r, delay));
    if (Math.random() < 0.1) throw new Error('随机失败');
    return `任务${i + 1}完成`;
  });

  await concurrentLimit(tasks, 3);
  concurrentLoading.value = false;
};

// ===== Token 失效自动刷新 =====
// 模拟一个 axios 实例：默认先返回 401，刷新 token 后再调用则成功
const tokenRefreshLoading = ref(false);
const multiTokenLoading = ref(false);
const refreshExpiredLoading = ref(false);
const tokenLogs = ref<{ type: string; msg: string; time: string }[]>([]);
const accessToken = ref('');
const refreshToken = ref('');
// 并发控制：是否正在刷新 + 等待队列
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};
const addTokenLog = (type: string, msg: string) => {
  tokenLogs.value.push({ type, msg, time: now() });
};

// 模拟后端：fail=true 抛 401；fail=false 返回数据
const mockRequest = (fail: boolean): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        const err: any = new Error('Request failed with status code 401');
        err.response = { status: 401, data: { code: 401, msg: 'token 已失效' } };
        err.config = { _retried: false };
        reject(err);
      } else {
        resolve({ data: { code: 0, data: { id: 1, name: '张三', age: 28 } } });
      }
    }, 200);
  });
};

// 模拟刷新 token 接口（仅模拟成功）
const mockRefreshApi = (): Promise<{ accessToken: string; refreshToken: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'AT_' + Date.now().toString(36),
        refreshToken: 'RT_' + Date.now().toString(36),
      });
    }, 400);
  });
};

// 模拟刷新 token 接口（refreshToken 也失效）
const mockRefreshApiExpired = (): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const err: any = new Error('refreshToken 失效');
      err.response = { status: 401, data: { code: 401, msg: 'refreshToken 已过期，请重新登录' } };
      reject(err);
    }, 300);
  });
};

// 第一次进入页面初始化一对 token
if (!accessToken.value) {
  accessToken.value = 'AT_init_' + Date.now().toString(36);
  refreshToken.value = 'RT_init_' + Date.now().toString(36);
}

const resetTokens = () => {
  isRefreshing = false;
  pendingQueue = [];
  accessToken.value = 'AT_init_' + Date.now().toString(36);
  refreshToken.value = 'RT_init_' + Date.now().toString(36);
  tokenLogs.value = [];
  addTokenLog('info', '🔄 已重置 token 状态');
};

/**
 * 场景 ①：单个请求遇到 401 → 刷新 token → 重试
 */
const doTokenRefresh = async () => {
  tokenRefreshLoading.value = true;
  tokenLogs.value = [];
  try {
    addTokenLog('info', `📤 发起业务请求 携带 accessToken=...${accessToken.value.slice(-6)}`);
    try {
      const res = await mockRequest(true); // 第一次必失败
      addTokenLog('success', `✅ 业务请求成功：${JSON.stringify(res.data)}`);
      return;
    } catch (err: any) {
      if (err.response?.status !== 401) throw err;
      addTokenLog('warning', '⚠️ 收到 401 → accessToken 失效');

      // 调用刷新 token 接口
      addTokenLog('info', '🔄 调用 /refresh-token 刷新 accessToken...');
      const { accessToken: newAt, refreshToken: newRt } = await mockRefreshApi();
      accessToken.value = newAt;
      refreshToken.value = newRt;
      addTokenLog('success', `✅ token 刷新完成 newAT=...${newAt.slice(-6)}`);

      // 用新 token 重试原请求
      addTokenLog('info', `🔁 用新 token 重新发起原请求`);
      const retryRes = await mockRequest(false);
      addTokenLog('success', `🎉 重试成功：${JSON.stringify(retryRes.data.data)}`);
    }
  } catch (err: any) {
    addTokenLog('error', `❌ 请求失败：${err.message}`);
  } finally {
    tokenRefreshLoading.value = false;
  }
};

/**
 * 场景 ②：并发 3 个请求同时遇到 401 → 只刷新 1 次 token
 */
const doMultipleTokenRefresh = async () => {
  multiTokenLoading.value = true;
  tokenLogs.value = [];
  // 每个请求的执行函数：先 401，再等待/触发刷新，最后重试
  const singleRequest = async (idx: number) => {
    try {
      addTokenLog('info', `📤 请求 #${idx} 发起，accessToken=...${accessToken.value.slice(-6)}`);
      await mockRequest(true);
    } catch (err: any) {
      if (err.response?.status !== 401) throw err;
      addTokenLog('warning', `⚠️ 请求 #${idx} 收到 401`);

      if (isRefreshing) {
        // 已经有别的请求在刷新，排队等待
        addTokenLog('info', `⏳ 请求 #${idx} 进入等待队列（token 正在刷新中）`);
        await new Promise<void>((resolve) => {
          pendingQueue.push(() => resolve());
        });
        addTokenLog('info', `▶️ 请求 #${idx} 拿到新 token，准备重试`);
      } else {
        // 第一个遇到 401 的请求触发刷新
        isRefreshing = true;
        addTokenLog('info', `🔄 请求 #${idx} 触发 /refresh-token`);
        const { accessToken: newAt, refreshToken: newRt } = await mockRefreshApi();
        accessToken.value = newAt;
        refreshToken.value = newRt;
        addTokenLog('success', `✅ token 刷新完成（由 #${idx} 触发）`);
        // 唤醒所有等待的请求
        pendingQueue.forEach((cb) => cb(newAt));
        pendingQueue = [];
        isRefreshing = false;
      }
      // 重试
      const retryRes = await mockRequest(false);
      addTokenLog('success', `🎉 请求 #${idx} 重试成功：${JSON.stringify(retryRes.data.data)}`);
      return retryRes;
    }
  };
  try {
    await Promise.all([1, 2, 3].map((i) => singleRequest(i)));
    addTokenLog('success', '🏆 3 个并发请求全部完成，期间只刷新了 1 次 token');
  } catch (err: any) {
    addTokenLog('error', `❌ 有请求失败：${err.message}`);
  } finally {
    multiTokenLoading.value = false;
  }
};

/**
 * 场景 ③：refreshToken 也失效 → 跳转登录
 */
const doRefreshTokenExpired = async () => {
  refreshExpiredLoading.value = true;
  tokenLogs.value = [];
  try {
    addTokenLog('info', `📤 发起业务请求，accessToken=...${accessToken.value.slice(-6)}`);
    try {
      await mockRequest(true);
    } catch (err: any) {
      if (err.response?.status !== 401) throw err;
      addTokenLog('warning', '⚠️ 收到 401 → 尝试刷新 token');

      addTokenLog('info', '🔄 调用 /refresh-token...');
      try {
        await mockRefreshApiExpired();
      } catch (refreshErr: any) {
        addTokenLog('error', `❌ refreshToken 也失效：${refreshErr.response.data.msg}`);
        addTokenLog('warning', '🚪 清除本地 token，跳转登录页 /login');
        accessToken.value = '';
        refreshToken.value = '';
        // 真实代码：window.location.href = '/login'
        return;
      }
      // 这里不会执行
      addTokenLog('info', '🔁 用新 token 重新发起原请求');
    }
    addTokenLog('info', '🔁 用新 token 重新发起原请求');
  } catch (err: any) {
    addTokenLog('error', `❌ 失败：${err.message}`);
  } finally {
    refreshExpiredLoading.value = false;
  }
};

// 代码示例
const basicCode = `// utils/request.ts
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

const cancelCode = `// 使用 AbortController 取消请求
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

const retryCode = `// 请求重试工具函数
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

const concurrentCode = `// 并发控制：限制最大同时请求数
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

const tokenRefreshCode = `// ✅ 推荐：直接复用 \`useTokenRefresh\` + \`createAuthInterceptor\` 这两个 hook
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

const fullRequestCode = `// 完整封装思路（推荐参考）
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
</script>

<style lang="less" scoped>
.axios-demo-page {
  padding: 20px;
  overflow-y: auto;
}
.demo-section {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-box {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
  &.warning {
    background: #fdf6ec;
    color: #e6a23c;
    border-color: #f5dab1;
  }
  &.error {
    background: #fef0f0;
    color: #f56c6c;
    border-color: #fde2e2;
  }
  &.success {
    background: #f0f9eb;
    color: #67c23a;
    border-color: #c2e7b0;
  }
}
.retry-log {
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.log-line {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  &.info {
    background: #f0f9ff;
    color: #409eff;
  }
  &.warning {
    background: #fdf6ec;
    color: #e6a23c;
  }
  &.success {
    background: #f0f9eb;
    color: #67c23a;
  }
  &.error {
    background: #fef0f0;
    color: #f56c6c;
  }
}
.concurrent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 8px;
  .req-item {
    padding: 6px;
    border-radius: 4px;
    font-size: 12px;
    text-align: center;
    &.pending {
      background: #f5f7fa;
      color: #909399;
    }
    &.running {
      background: #fff7e6;
      color: #e6a23c;
    }
    &.done {
      background: #f0f9eb;
      color: #67c23a;
    }
    &.failed {
      background: #fef0f0;
      color: #f56c6c;
    }
  }
}
.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
.token-state {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  flex-wrap: wrap;
  .token-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .token-label {
    color: #606266;
    font-weight: 500;
  }
}
.token-log {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding: 4px;
  background: #1e1e2e;
  border-radius: 6px;
  .log-time {
    color: #6c7086;
    font-size: 11px;
    margin-right: 6px;
    font-family: monospace;
  }
  .log-empty {
    color: #6c7086;
    font-size: 12px;
    text-align: center;
    padding: 20px;
  }
}
.token-log .log-line {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
  &.info {
    background: rgba(64, 158, 255, 0.15);
    color: #74c0fc;
  }
  &.warning {
    background: rgba(230, 162, 60, 0.15);
    color: #f9e2af;
  }
  &.success {
    background: rgba(103, 194, 58, 0.15);
    color: #a6e3a1;
  }
  &.error {
    background: rgba(245, 108, 108, 0.15);
    color: #f38ba8;
  }
}
</style>
