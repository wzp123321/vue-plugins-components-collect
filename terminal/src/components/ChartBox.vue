<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useECharts, type EChartsOption } from '../hooks/useECharts';

interface Props {
  option: EChartsOption;
  /** 是否自动 resize 监听 */
  autoresize?: boolean;
}
const props = withDefaults(defineProps<Props>(), { autoresize: true });

const elRef = ref<HTMLElement | null>(null);
useECharts(elRef, () => props.option);

onMounted(() => {
  // 兜底：等一帧再 resize 一次，确保父容器宽度稳定
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
  });
});

watch(
  () => props.option,
  () => {
    // 父容器尺寸变化或 option 重置时通知 resize
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  },
  { deep: true },
);
</script>

<template>
  <div ref="elRef" class="chart-box" />
</template>

<style lang="less" scoped>
.chart-box {
  width: 100%;
  height: 100%;
}
</style>
