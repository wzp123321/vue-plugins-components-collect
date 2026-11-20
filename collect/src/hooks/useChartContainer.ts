/**
 * echarts 容器
 * ============================================================================
 * 职责：把「拿到 DOM → 初始化实例 → 跟随容器尺寸 resize → 跟随亮暗主题重建 → 卸载释放」
 *       这套每次都要写的样板收敛到一处。
 *
 * 主题处理：src/config/echarts/setup.ts 的 init 会按 html.dark 自动注入 ai-dark / ai-light，
 *   而主题只能在 init 时决定，所以切换主题时销毁重建实例（setOption 改不掉坐标轴文字色）。
 *   重建后会自动重新绑定 events，调用方不需要关心。
 *
 * 与 hooks/useEChartsInit 的区别：那个用 window.onresize（多图并存会互相覆盖），
 *   这里用 ResizeObserver 跟随容器本身，适合一页多个图表。
 */
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { init } from '@/config/echarts/setup';
import type { EChartsOption, EChartsType } from '@/config/echarts/setup';
import { useThemeStore } from '@/store/modules/useThemeStore';

export interface ChartEventParams {
  name?: string;
  dataIndex?: number;
  seriesName?: string;
  value?: string | number | (string | number)[];
}

export interface UseChartContainerOptions {
  /** 图表事件；主题切换导致实例重建后会自动重新绑定 */
  events?: Record<string, (params: ChartEventParams) => void>;
}

export const useChartContainer = (optionFactory: () => EChartsOption, options: UseChartContainerOptions = {}) => {
  const el = ref<HTMLElement>();
  const chart = shallowRef<EChartsType | null>(null);
  const themeStore = useThemeStore();
  let observer: ResizeObserver | null = null;

  const bindEvents = (instance: EChartsType) => {
    Object.entries(options.events ?? {}).forEach(([name, handler]) => {
      // echarts 的事件回调签名是 (...args: unknown[])，这里按业务侧统一的参数结构收窄后传入
      instance.on(name, handler as (...args: unknown[]) => void);
    });
  };

  /** 建实例并写入配置；主题切换时也是走这里重建 */
  const render = () => {
    if (!el.value) return;
    chart.value?.dispose();
    chart.value = init(el.value);
    chart.value.setOption(optionFactory());
    bindEvents(chart.value);
  };

  const resize = () => chart.value?.resize();

  onMounted(() => {
    render();
    if (el.value) {
      observer = new ResizeObserver(() => resize());
      observer.observe(el.value);
    }
  });

  watch(
    () => themeStore.isDark,
    () => render(),
  );

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
    chart.value?.dispose();
    chart.value = null;
  });

  return { el, chart, render, resize };
};
