import { ref } from 'vue';

export interface TokenLog {
  type: string;
  msg: string;
  time: string;
}

/** 模拟业务请求：fail=true 抛 401，fail=false 返回数据 */
const mockRequest = (fail: boolean): Promise<any> =>
  new Promise((resolve, reject) => {
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

/** 模拟刷新 token 接口（成功） */
const mockRefreshApi = (): Promise<{ accessToken: string; refreshToken: string }> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: `AT_${Date.now().toString(36)}`,
        refreshToken: `RT_${Date.now().toString(36)}`,
      });
    }, 400);
  });

/** 模拟刷新 token 接口（refreshToken 也失效） */
const mockRefreshApiExpired = (): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      const err: any = new Error('refreshToken 失效');
      err.response = { status: 401, data: { code: 401, msg: 'refreshToken 已过期，请重新登录' } };
      reject(err);
    }, 300);
  });

/** Token 失效自动刷新 + 重试（并发安全）演示 hook */
export const useTokenRefreshDemo = () => {
  const tokenRefreshLoading = ref(false);
  const multiTokenLoading = ref(false);
  const refreshExpiredLoading = ref(false);
  const tokenLogs = ref<TokenLog[]>([]);
  const accessToken = ref('');
  const refreshToken = ref('');

  // 并发控制：是否正在刷新 + 等待队列
  let isRefreshing = false;
  let pendingQueue: Array<(token: string) => void> = [];

  const now = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };
  const addLog = (type: string, msg: string) => {
    tokenLogs.value.push({ type, msg, time: now() });
  };

  // 初始化一对 token
  if (!accessToken.value) {
    accessToken.value = `AT_init_${Date.now().toString(36)}`;
    refreshToken.value = `RT_init_${Date.now().toString(36)}`;
  }

  const resetTokens = () => {
    isRefreshing = false;
    pendingQueue = [];
    accessToken.value = `AT_init_${Date.now().toString(36)}`;
    refreshToken.value = `RT_init_${Date.now().toString(36)}`;
    tokenLogs.value = [];
    addLog('info', '🔄 已重置 token 状态');
  };

  /**
   * 场景 ①：单个请求遇到 401 → 刷新 token → 重试
   */
  const doTokenRefresh = async () => {
    tokenRefreshLoading.value = true;
    tokenLogs.value = [];
    try {
      addLog('info', `📤 发起业务请求 携带 accessToken=...${accessToken.value.slice(-6)}`);
      try {
        const res = await mockRequest(true); // 第一次必失败
        addLog('success', `✅ 业务请求成功：${JSON.stringify(res.data)}`);
      } catch (err: any) {
        if (err.response?.status !== 401) throw err;
        addLog('warning', '⚠️ 收到 401 → accessToken 失效');

        // 调用刷新 token 接口
        addLog('info', '🔄 调用 /refresh-token 刷新 accessToken...');
        const { accessToken: newAt, refreshToken: newRt } = await mockRefreshApi();
        accessToken.value = newAt;
        refreshToken.value = newRt;
        addLog('success', `✅ token 刷新完成 newAT=...${newAt.slice(-6)}`);

        // 用新 token 重试原请求
        addLog('info', `🔁 用新 token 重新发起原请求`);
        const retryRes = await mockRequest(false);
        addLog('success', `🎉 重试成功：${JSON.stringify(retryRes.data.data)}`);
      }
    } catch (err: any) {
      addLog('error', `❌ 请求失败：${err.message}`);
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
    const singleRequest = async (idx: number) => {
      try {
        addLog('info', `📤 请求 #${idx} 发起，accessToken=...${accessToken.value.slice(-6)}`);
        await mockRequest(true);
      } catch (err: any) {
        if (err.response?.status !== 401) throw err;
        addLog('warning', `⚠️ 请求 #${idx} 收到 401`);

        if (isRefreshing) {
          // 已经有别的请求在刷新，排队等待
          addLog('info', `⏳ 请求 #${idx} 进入等待队列（token 正在刷新中）`);
          await new Promise<void>((resolve) => {
            pendingQueue.push(() => resolve());
          });
          addLog('info', `▶️ 请求 #${idx} 拿到新 token，准备重试`);
        } else {
          // 第一个遇到 401 的请求触发刷新
          isRefreshing = true;
          addLog('info', `🔄 请求 #${idx} 触发 /refresh-token`);
          const { accessToken: newAt, refreshToken: newRt } = await mockRefreshApi();
          accessToken.value = newAt;
          refreshToken.value = newRt;
          addLog('success', `✅ token 刷新完成（由 #${idx} 触发）`);
          // 唤醒所有等待的请求
          pendingQueue.forEach((cb) => cb(newAt));
          pendingQueue = [];
          isRefreshing = false;
        }
        // 重试
        const retryRes = await mockRequest(false);
        addLog('success', `🎉 请求 #${idx} 重试成功：${JSON.stringify(retryRes.data.data)}`);
      }
    };
    try {
      await Promise.all([1, 2, 3].map((i) => singleRequest(i)));
      addLog('success', '🏆 3 个并发请求全部完成，期间只刷新了 1 次 token');
    } catch (err: any) {
      addLog('error', `❌ 有请求失败：${err.message}`);
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
      addLog('info', `📤 发起业务请求，accessToken=...${accessToken.value.slice(-6)}`);
      try {
        await mockRequest(true);
      } catch (err: any) {
        if (err.response?.status !== 401) throw err;
        addLog('warning', '⚠️ 收到 401 → 尝试刷新 token');

        addLog('info', '🔄 调用 /refresh-token...');
        try {
          await mockRefreshApiExpired();
        } catch (refreshErr: any) {
          addLog('error', `❌ refreshToken 也失效：${refreshErr.response.data.msg}`);
          addLog('warning', '🚪 清除本地 token，跳转登录页 /login');
          accessToken.value = '';
          refreshToken.value = '';
          // 真实代码：window.location.href = '/login'
          return;
        }
        // 这里不会执行
        addLog('info', '🔁 用新 token 重新发起原请求');
      }
      addLog('info', '🔁 用新 token 重新发起原请求');
    } catch (err: any) {
      addLog('error', `❌ 失败：${err.message}`);
    } finally {
      refreshExpiredLoading.value = false;
    }
  };

  return {
    tokenRefreshLoading,
    multiTokenLoading,
    refreshExpiredLoading,
    tokenLogs,
    accessToken,
    refreshToken,
    resetTokens,
    doTokenRefresh,
    doMultipleTokenRefresh,
    doRefreshTokenExpired,
  };
}
