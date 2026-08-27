import { ref } from 'vue';
import axios from 'axios';

/** AbortController 请求取消 hook */
export function useCancelRequest() {
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

  return { reqRunning, cancelStatus, startLongReq, cancelReq };
}
