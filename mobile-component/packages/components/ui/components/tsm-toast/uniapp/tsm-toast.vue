/** * Toast 提示组件 * @description 该组件用于短暂提示，支持多种主题类型 */
<template>
  <view class="tsm-toast" v-if="isShow">
    <view class="tsm-toast__content" :class="bemClass" :style="customStyle">
      <tsm-loading-icon v-if="type === 'loading'" mode="circle" color="rgb(255, 255, 255)" size="25" />
      <icon-setting />
      <view v-if="type === 'loading'" style="height: 12px; width: 100%"></view>
      <text class="tsm-toast__text">{{ message }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import type { ToastProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * Toast 组件 Props
 * @property {string} message - 提示内容
 * @property {string} type - 主题类型 (primary | success | warning | error | loading | default)
 * @property {number} duration - 展示时长，-1表示不消失
 * @property {boolean|string} icon - 是否显示图标
 * @property {string} position - 显示位置 (center | top | bottom)
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<ToastProps>(), defaultProps);

const isShow = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const bemClass = computed(() => {
  return bem('toast', [props.type], [], props.customClass);
});

const iconName = computed(() => {
  if (!props.icon || props.icon === 'none') return '';
  if (props.icon === true) {
    const iconMap: Record<string, string> = {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'error-circle',
      primary: 'info-circle',
    };
    return iconMap[props.type] || '';
  }
  return props.icon;
});

const clearTimer = () => {
  isShow.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const show = (options: Partial<ToastProps>) => {
  Object.assign(props, options);
  clearTimer();
  isShow.value = true;
  if (props.duration !== -1) {
    timer = setTimeout(() => {
      clearTimer();
    }, props.duration);
  }
};

const hide = () => {
  clearTimer();
};

defineExpose({ show, hide });

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped lang="scss">
.tsm-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10090;
  pointer-events: none;
}

.tsm-toast__content {
  display: flex;
  padding: 12px 20px;
  border-radius: 4px;
  background-color: #585858;
  color: #fff;
  align-items: center;
  max-width: 600rpx;
  position: relative;
  pointer-events: auto;
}

.tsm-toast--loading {
  flex-direction: column;
  padding: 20px 20px;
}

.tsm-toast__text {
  color: #fff;
  font-size: 15px;
  line-height: 15px;
}

.tsm-toast--primary {
  color: #2979ff;
  background-color: #ecf5ff;
  border: 1px solid rgb(215, 234, 254);
}

.tsm-toast--success {
  color: #19be6b;
  background-color: #dbf1e1;
  border: 1px solid #bef5c8;
}

.tsm-toast--error {
  color: #fa3534;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.tsm-toast--warning {
  color: #ff9900;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.tsm-toast--default {
  color: #fff;
  background-color: #585858;
}
</style>
