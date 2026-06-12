<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { formatNumber } from '../utils/format';

interface Props {
  value: number;
  /** 整数位数（不足补 0） */
  digits?: number;
  /** 动画时长（ms） */
  duration?: number;
}
const props = withDefaults(defineProps<Props>(), { digits: 0, duration: 600 });

const display = ref('0');

const play = () => {
  const start = Number(display.value.replace(/,/g, '')) || 0;
  const end = props.value;
  const startTs = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - startTs) / props.duration);
    const cur = start + (end - start) * p;
    display.value = formatNumber(Math.round(cur));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

onMounted(play);
watch(() => props.value, play);
</script>

<template>
  <span class="digital-number">{{ display }}</span>
</template>

<style lang="less" scoped>
.digital-number {
  font-family: 'DIN', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700;
  color: #4cf3ff;
  text-shadow: 0 0 8px rgba(76, 243, 255, 0.5);
  font-variant-numeric: tabular-nums;
}
</style>
