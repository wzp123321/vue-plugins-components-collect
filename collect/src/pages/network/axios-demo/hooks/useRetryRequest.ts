import { ref } from 'vue';

export interface LogLine {
  type: string;
  msg: string;
}

/** 通用：带重试的执行函数 */
async function retryRequest(
  fn: () => Promise<any>,
  retries = 3,
  delay = 1000,
  onRetry?: (attempt: number) => void,
): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i < retries) {
        onRetry?.(i + 1);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

/** 请求重试机制 hook */
export function useRetryRequest() {
  const retryLoading = ref(false);
  const retryLogs = ref<LogLine[]>([]);

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
        (failedCount) => {
          retryLogs.value.push({ type: 'warning', msg: `⚠️ 第 ${failedCount} 次失败，500ms 后重试...` });
        },
      );
      retryLogs.value.push({ type: 'success', msg: '✅ 最终成功！' });
    } catch {
      retryLogs.value.push({ type: 'error', msg: '❌ 重试耗尽，最终失败' });
    } finally {
      retryLoading.value = false;
    }
  };

  return { retryLoading, retryLogs, doRetry };
}
