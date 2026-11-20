<!--
  数字孪生 —— 选中设备趋势
  ============================================================================
  切换设备时只 setOption 更新数据，不重建实例（主题切换由 useChartContainer 负责重建）。
  颜色取设备状态色，与 3D 光环、占比图同源。
-->
<template>
  <div class="twin-trend">
    <header class="twin-trend__head">
      <span class="twin-trend__title">{{ device.name }} · {{ device.tagLabel }}</span>
      <span class="twin-trend__unit">{{ device.unit }}</span>
    </header>
    <div ref="el" class="twin-trend__chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import type { EChartsOption } from '@/config/echarts/setup';
import { chartToken } from '@/config/echarts/theme';
import { useChartContainer } from '@/hooks';
import { TWIN_STATUS_COLOR, trendOf, type TwinDevice } from '../twin-data';

defineOptions({ name: 'TwinTrendChart' });

const props = defineProps<{ device: TwinDevice }>();

const buildOption = (): EChartsOption => {
  const points = trendOf(props.device);
  const color = TWIN_STATUS_COLOR[props.device.status];
  const dim = chartToken('textDim');

  return {
    grid: { left: 4, right: 8, top: 14, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map((point) => point.time),
      axisTick: { show: false },
      axisLabel: { color: dim, interval: 5 },
      axisLine: { lineStyle: { color: chartToken('borderStrong') } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: dim },
      splitLine: { lineStyle: { color: chartToken('border'), type: 'dashed' } },
    },
    series: [
      {
        name: props.device.tagLabel,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        areaStyle: { color, opacity: 0.14 },
        data: points.map((point) => point.value),
      },
    ],
  };
};

const { el, chart } = useChartContainer(buildOption);

watch(
  () => props.device.id,
  () => chart.value?.setOption(buildOption(), true),
);
</script>

<style lang="less" scoped>
.twin-trend {
  padding: 12px 14px 8px;
  border: 1px solid var(--ai-hairline);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__unit {
    font-size: 11px;
    color: var(--ai-text-mute);
  }

  &__chart {
    height: 170px;
  }
}
</style>
