<template>
  <div class="vc-theme">
    <el-button size="small" @click="toggle">{{ isDark ? '切换浅色' : '切换深色' }}</el-button>
    <div ref="chartRef" class="vc-theme__chart"></div>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import VChart from '@visactor/vchart';

type VChartSpec = ConstructorParameters<typeof VChart>[0];

const chartRef = ref<HTMLElement>();
const isDark = ref(false);
let chart: VChart | null = null;

const buildSpec = (): VChartSpec => ({
    type: 'bar',
    autoFit: true,
    theme: isDark.value ? 'dark' : 'light',
    data: {
      values: [
        { type: '搜索', value: 1048 },
        { type: '直接访问', value: 735 },
        { type: '邮件营销', value: 580 },
        { type: '联盟广告', value: 484 },
        { type: '视频广告', value: 300 },
      ],
    },
    xField: 'type',
    yField: 'value',
    bar: { style: { cornerRadius: [4, 4, 0, 0] } },
  });

const toggle = () => {
  isDark.value = !isDark.value;
  chart?.updateSpec(buildSpec());
};

onMounted(() => {
  chart = new VChart(buildSpec(), { dom: chartRef.value });
  chart.renderSync();
});

onBeforeUnmount(() => {
  chart?.release();
  chart = null;
});
</script>
<style lang="less" scoped>
.vc-theme {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .vc-theme__chart {
    width: 100%;
    flex: 1;
    min-height: 0;
  }
}
</style>
