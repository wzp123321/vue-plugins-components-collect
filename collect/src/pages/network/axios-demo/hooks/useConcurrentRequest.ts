import { ref } from 'vue';

export interface ConcurrentReq {
  id: number;
  status: 'pending' | 'running' | 'done' | 'failed';
}

/** 通用：限制最大并发数 */
const concurrentLimit = async (
  tasks: (() => Promise<any>)[],
  limit: number,
  onStatusChange?: (index: number, status: ConcurrentReq['status']) => void,
) => {
  const results: any[] = [];
  let index = 0;

  const runNext = async (): Promise<void> => {
    if (index >= tasks.length) return;
    const i = index++;
    onStatusChange?.(i, 'running');
    try {
      results[i] = await tasks[i]();
      onStatusChange?.(i, 'done');
    } catch {
      onStatusChange?.(i, 'failed');
    }
    await runNext();
  };

  const workers = Array(Math.min(limit, tasks.length)).fill(null).map(runNext);
  await Promise.all(workers);
  return results;
}

/** 并发控制 hook */
export const useConcurrentRequest = () => {
  const concurrentLoading = ref(false);
  const concurrentReqs = ref<ConcurrentReq[]>([]);

  const doConcurrent = async () => {
    concurrentLoading.value = true;
    concurrentReqs.value = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      status: 'pending' as const,
    }));

    const tasks = Array.from({ length: 8 }, (_, i) => async () => {
      const delay = Math.random() * 1500 + 500;
      await new Promise((r) => {
        setTimeout(r, delay);
      });
      if (Math.random() < 0.1) throw new Error('随机失败');
      return `任务${i + 1}完成`;
    });

    await concurrentLimit(tasks, 3, (i, status) => {
      concurrentReqs.value[i].status = status;
    });
    concurrentLoading.value = false;
  };

  return { concurrentLoading, concurrentReqs, doConcurrent };
}
