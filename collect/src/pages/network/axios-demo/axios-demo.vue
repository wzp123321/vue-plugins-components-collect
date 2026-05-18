<template>
  <div class="axios-demo-page">
    <h5>Axios 请求层封装演示</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
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
      <el-col :span="12" style="margin-top:16px">
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
      <el-col :span="12" style="margin-top:16px">
        <el-card>
          <template #header>④ 并发控制（最多同时 3 个请求）</template>
          <div class="demo-section">
            <el-button type="primary" @click="doConcurrent" :loading="concurrentLoading">发起 8 个请求（限并发 3）</el-button>
            <div class="concurrent-grid">
              <div v-for="req in concurrentReqs" :key="req.id" class="req-item" :class="req.status">
                #{{ req.id }} {{ req.status === 'pending' ? '等待中' : req.status === 'running' ? '请求中...' : req.status === 'done' ? '✅ 完成' : '❌ 失败' }}
              </div>
            </div>
          </div>
          <pre class="code-block">{{ concurrentCode }}</pre>
        </el-card>
      </el-col>

      <!-- 完整封装代码 -->
      <el-col :span="24" style="margin-top:16px">
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
  } finally { getLoading.value = false; }
};

const doPost = async () => {
  postLoading.value = true;
  try {
    const res = await axios.post('https://jsonplaceholder.typicode.com/posts', { title: '测试', body: 'hello', userId: 1 }, { timeout: 5000 });
    result1.value = `✅ POST 成功：id=${res.data.id}, title="${res.data.title}"`;
  } catch {
    result1.value = '❌ 请求失败';
  } finally { postLoading.value = false; }
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
  } finally { reqRunning.value = false; }
};

const cancelReq = () => { abortController?.abort(); };

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
  } finally { retryLoading.value = false; }
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
.axios-demo-page { padding: 20px; overflow-y: auto; }
.demo-section { margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
.result-box {
  padding: 8px 12px; border-radius: 6px; font-size: 13px;
  background: #f0f9ff; color: #409eff; border: 1px solid #b3d8ff;
  &.warning { background: #fdf6ec; color: #e6a23c; border-color: #f5dab1; }
  &.error { background: #fef0f0; color: #f56c6c; border-color: #fde2e2; }
  &.success { background: #f0f9eb; color: #67c23a; border-color: #c2e7b0; }
}
.retry-log { max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.log-line {
  font-size: 12px; padding: 3px 8px; border-radius: 4px;
  &.info { background: #f0f9ff; color: #409eff; }
  &.warning { background: #fdf6ec; color: #e6a23c; }
  &.success { background: #f0f9eb; color: #67c23a; }
  &.error { background: #fef0f0; color: #f56c6c; }
}
.concurrent-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px;
  .req-item {
    padding: 6px; border-radius: 4px; font-size: 12px; text-align: center;
    &.pending { background: #f5f7fa; color: #909399; }
    &.running { background: #fff7e6; color: #e6a23c; }
    &.done { background: #f0f9eb; color: #67c23a; }
    &.failed { background: #fef0f0; color: #f56c6c; }
  }
}
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
