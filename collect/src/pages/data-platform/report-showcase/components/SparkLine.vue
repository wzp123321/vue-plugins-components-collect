<!--
  迷你走势线（纯 SVG，不引 echarts）
  ============================================================================
  指标卡里的 sparkline 数量多、尺寸小，用 echarts 实例不划算，这里直接算点画 polyline。
-->
<template>
  <svg class="spark-line" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon v-if="filled" :points="areaPoints" :fill="`url(#${gradientId})`" />
    <polyline :points="linePoints" fill="none" :stroke="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'SparkLine' });

const props = withDefaults(
  defineProps<{
    values: number[];
    color?: string;
    filled?: boolean;
  }>(),
  { color: 'var(--ai-accent)', filled: true },
);

const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`;

const coords = computed(() => {
  const max = Math.max(...props.values);
  const min = Math.min(...props.values);
  const span = max - min || 1;
  const step = props.values.length > 1 ? 100 / (props.values.length - 1) : 100;
  return props.values.map((value, index) => {
    const x = index * step;
    const y = 25 - ((value - min) / span) * 21;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
});

const linePoints = computed(() => coords.value.join(' '));
const areaPoints = computed(() => `${linePoints.value} 100,28 0,28`);
</script>

<style lang="less" scoped>
.spark-line {
  display: block;
  width: 100%;
  height: 30px;
  overflow: visible;
}
</style>
