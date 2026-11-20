<!--
  数字孪生 —— 设备能耗占比
  ============================================================================
  横向条形图兼设备列表：点击条形把 3D 场景切到对应设备（emit select）。
  选中项高亮，其余降透明度；颜色统一取设备状态色。
-->
<template>
  <div class="twin-share">
    <header class="twin-share__head">
      <span class="twin-share__title">设备能耗占比</span>
      <span class="twin-share__hint">点击条形联动 3D</span>
    </header>
    <div ref="el" class="twin-share__chart"></div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import type { EChartsOption } from '@/config/echarts/setup';
import { chartToken } from '@/config/echarts/theme';
import { useChartContainer, type ChartEventParams } from '@/hooks';
import { TWIN_DEVICES, TWIN_STATUS_COLOR } from '../twin-data';

defineOptions({ name: 'TwinShareChart' });

const props = defineProps<{ selectedId: string }>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

const buildOption = (): EChartsOption => {
  const dim = chartToken('textDim');

  return {
    grid: { left: 4, right: 34, top: 8, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>占比 {c}%',
    },
    xAxis: {
      type: 'value',
      max: 32,
      axisLabel: { color: dim, formatter: '{value}%' },
      splitLine: { lineStyle: { color: chartToken('border'), type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: TWIN_DEVICES.map((device) => device.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: dim },
    },
    series: [
      {
        type: 'bar',
        barWidth: 12,
        label: { show: true, position: 'right', color: dim, formatter: '{c}%' },
        data: TWIN_DEVICES.map((device) => ({
          value: device.share,
          itemStyle: {
            color: TWIN_STATUS_COLOR[device.status],
            borderRadius: [0, 4, 4, 0],
            opacity: props.selectedId === device.id ? 1 : 0.42,
          },
        })),
      },
    ],
  };
};

const onChartClick = (params: ChartEventParams) => {
  const device = params.dataIndex === undefined ? null : TWIN_DEVICES[params.dataIndex];
  if (device) emit('select', device.id);
};

const { el, chart } = useChartContainer(buildOption, { events: { click: onChartClick } });

watch(
  () => props.selectedId,
  () => chart.value?.setOption(buildOption(), true),
);
</script>

<style lang="less" scoped>
.twin-share {
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

  &__hint {
    font-size: 11px;
    color: var(--ai-text-mute);
  }

  &__chart {
    height: 190px;
  }
}
</style>
