/**
 * 简易定时器 hook：组件卸载时自动清理
 */
import { onBeforeUnmount, ref, type Ref } from 'vue';

export const useInterval = (
  fn: () => void,
  ms: number,
): Ref<number | null> => {
  const timer = ref<number | null>(null);
  const start = () => {
    stop();
    timer.value = window.setInterval(fn, ms);
  };
  const stop = () => {
    if (timer.value !== null) {
      window.clearInterval(timer.value);
      timer.value = null;
    }
  };
  start();
  onBeforeUnmount(stop);
  return timer;
};
