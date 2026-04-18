/** * Transition 动画组件 * @description 动画组件，用于显示/隐藏动画 */
<template>
  <transition :name="transitionName" :duration="duration">
    <view v-if="show" class="tsm-transition" :class="customClass" :style="customStyle">
      <slot />
    </view>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TransitionProps } from './props';
import { defaultProps } from './props';

/**
 * Transition 组件 Props
 * @property {boolean} show - 是否显示
 * @property {string} mode - 动画模式 (fade | slide-up | slide-down | slide-left | slide-right | zoom)
 * @property {number} duration - 动画时长
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<TransitionProps>(), defaultProps);

const transitionName = computed(() => {
  return `tsm-${props.mode}`;
});

const duration = computed(() => {
  return props.duration || 300;
});
</script>

<style scoped lang="scss">
.tsm-transition {
  transition-property: all;
}

/* Fade 动画 */
.tsm-fade-enter-active,
.tsm-fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.tsm-fade-enter-from {
  opacity: 0;
}

.tsm-fade-leave-to {
  opacity: 0;
}

/* Slide Up 动画 */
.tsm-slide-up-enter-active,
.tsm-slide-up-leave-active {
  transition: all 0.3s ease-in-out;
}

.tsm-slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.tsm-slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Slide Down 动画 */
.tsm-slide-down-enter-active,
.tsm-slide-down-leave-active {
  transition: all 0.3s ease-in-out;
}

.tsm-slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.tsm-slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Slide Left 动画 */
.tsm-slide-left-enter-active,
.tsm-slide-left-leave-active {
  transition: all 0.3s ease-in-out;
}

.tsm-slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.tsm-slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide Right 动画 */
.tsm-slide-right-enter-active,
.tsm-slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.tsm-slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.tsm-slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Zoom 动画 */
.tsm-zoom-enter-active,
.tsm-zoom-leave-active {
  transition: all 0.3s ease-in-out;
}

.tsm-zoom-enter-from {
  transform: scale(0.8);
  opacity: 0;
}

.tsm-zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
