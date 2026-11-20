/**
 * 滚动到视口才渲染
 * ============================================================================
 * 用途：长页面（报表画廊、瀑布流）里成组的图表/表格，未进入视口前不挂载，
 *       避免首屏一次性初始化十几个 echarts 实例造成的卡顿。
 *
 * 行为：命中一次即置 visible，之后不再回收（回收会导致用户往回滚时重新初始化，反而更卡）。
 *       rootMargin 默认向下预加载 120px，滚动时体感更连续。
 */
import { ref, type Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

export interface UseInViewRenderOptions {
  /** 预加载边距，命中即渲染。默认 '120px 0px' */
  rootMargin?: string;
  /** 交叉比例阈值，默认 0（露出 1px 即算进入） */
  threshold?: number;
}

export const useInViewRender = (target: Ref<HTMLElement | undefined>, options: UseInViewRenderOptions = {}) => {
  const visible = ref(false);
  /** 首次命中的时间戳（performance.now），用于页面展示渲染耗时的起点 */
  const hitAt = ref(0);

  useIntersectionObserver(
    target,
    (entries) => {
      if (visible.value) return;
      if (!entries.some((entry) => entry.isIntersecting)) return;
      visible.value = true;
      hitAt.value = performance.now();
    },
    { rootMargin: options.rootMargin ?? '120px 0px', threshold: options.threshold ?? 0 },
  );

  return { visible, hitAt };
};
