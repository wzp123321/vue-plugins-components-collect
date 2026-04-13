/** * LineProgress 线性进度条组件 * @description 线性进度条组件，用于显示进度 */
<template>
  <view class="tsm-line-progress" :class="bemClass" :style="customStyle">
    <view class="tsm-line-progress__outer" :style="{ height: addUnit(String(height)), backgroundColor: bgColor }">
      <view class="tsm-line-progress__inner" :style="{ width: `${value}%`, backgroundColor: color }"></view>
    </view>
    <view v-if="showText" class="tsm-line-progress__text">
      <text>{{ value }}%</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LineProgressProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

/**
 * LineProgress 组件 Props
 * @property {number} value - 进度值
 * @property {number|string} height - 进度条高度
 * @property {string} color - 进度条颜色
 * @property {string} bgColor - 背景颜色
 * @property {boolean} showText - 是否显示文字
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<LineProgressProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('line-progress', [], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-line-progress {
  display: flex;
  align-items: center;
}

.tsm-line-progress__outer {
  flex: 1;
  border-radius: 100px;
  overflow: hidden;
}

.tsm-line-progress__inner {
  height: 100%;
  border-radius: 100px;
  transition: width 0.3s;
}

.tsm-line-progress__text {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
  min-width: 40px;
  text-align: right;
}
</style>
