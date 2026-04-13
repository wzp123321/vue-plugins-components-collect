/** * CircleProgress 环形进度条组件 * @description 环形进度条组件，用于显示百分比进度 */
<template>
  <view class="tsm-circle-progress" :class="bemClass" :style="customStyle">
    <canvas
      class="tsm-circle-progress__canvas"
      canvas-id="tsm-circle-progress"
      :style="{ width: addUnit(String(size)), height: addUnit(String(size)) }"
    ></canvas>
    <view class="tsm-circle-progress__text" v-if="showText">
      <text>{{ value }}%</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { CircleProgressProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

/**
 * CircleProgress 组件 Props
 * @property {number} value - 进度值
 * @property {number|string} size - 进度条大小
 * @property {number} strokeWidth - 进度条宽度
 * @property {string} color - 进度条颜色
 * @property {string} bgColor - 背景颜色
 * @property {boolean} showText - 是否显示文字
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<CircleProgressProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('circle-progress', [], [], props.customClass);
});

onMounted(() => {
  // Draw circle progress
  const ctx = uni.createCanvasContext('tsm-circle-progress');
  const center = Number(props.size) / 2;
  const radius = center - props.strokeWidth / 2;

  // Background circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.setStrokeStyle(props.bgColor);
  ctx.setLineWidth(props.strokeWidth);
  ctx.stroke();

  // Progress circle
  const angle = (props.value / 100) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(center, center, radius, -Math.PI / 2, angle - Math.PI / 2);
  ctx.setStrokeStyle(props.color);
  ctx.setLineWidth(props.strokeWidth);
  ctx.setLineCap('round');
  ctx.stroke();

  ctx.draw();
});
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

.tsm-circle-progress {
  position: relative;
  @include tsm-display-inline-flex();
  align-items: center;
  justify-content: center;
}

.tsm-circle-progress__canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.tsm-circle-progress__text {
  position: relative;
  z-index: 1;
  font-size: 14px;
  color: #303133;
}
</style>
