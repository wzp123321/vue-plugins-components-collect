/**
 * echarts Õ®”√ hook
 */
import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue';
import * as echarts from 'echarts/core';
import {
  BarChart, LineChart, PieChart, GaugeChart, FunnelChart, RadarChart,
  type BarSeriesOption, type LineSeriesOption, type PieSeriesOption,
  type GaugeSeriesOption, type FunnelSeriesOption, type RadarSeriesOption,
} from 'echarts/charts';
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DatasetComponent, TransformComponent, ToolboxComponent,
  type GridComponentOption, type TooltipComponentOption,
  type LegendComponentOption, type TitleComponentOption,
  type DatasetComponentOption,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart, LineChart, PieChart, GaugeChart, FunnelChart, RadarChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  DatasetComponent, TransformComponent, ToolboxComponent,
  LabelLayout, UniversalTransition, CanvasRenderer,
]);

export type EChartsOption = echarts.ComposeOption<
  | BarSeriesOption | LineSeriesOption | PieSeriesOption
  | GaugeSeriesOption | FunnelSeriesOption | RadarSeriesOption
  | GridComponentOption | TooltipComponentOption | LegendComponentOption
  | TitleComponentOption | DatasetComponentOption
>;

export const useECharts = (
  elRef: Ref<HTMLElement | null>,
  getOption: () => EChartsOption,
) => {
  const chart = shallowRef<echarts.ECharts | null>(null);

  const init = () => {
    if (!elRef.value) return;
    chart.value = echarts.init(elRef.value);
    chart.value.setOption(getOption());
  };

  const resize = () => chart.value?.resize();

  onMounted(() => {
    init();
    window.addEventListener('resize', resize);
  });

  watch(getOption, () => {
    chart.value?.setOption(getOption(), true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize);
    chart.value?.dispose();
    chart.value = null;
  });

  return { chart, resize };
};
