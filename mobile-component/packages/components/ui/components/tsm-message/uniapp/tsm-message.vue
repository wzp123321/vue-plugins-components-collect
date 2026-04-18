/** * Message 消息提示组件 * @description 该组件一般用于页面顶部向下滑出一个提示，尔后自动收起的场景 */
<template>
  <tsm-transition mode="slide-down" :customStyle="containerStyle" :show="open">
    <view class="tsm-message" :class="bemClass" :style="customStyle">
      <view class="tsm-message-left">
        <slot name="icon">
          <icon-information-fill v-if="typeValue === 'info'" color="var(--tsm-color-primary)" />
          <icon-circle-check-fill v-else-if="typeValue === 'success'" color="var(--tsm-color-success)" />
          <icon-warning-fill v-else-if="typeValue === 'warning'" color="var(--tsm-color-warning)" />
          <icon-warning-fill v-else-if="typeValue === 'error'" color="var(--tsm-color-danger)" />
          <icon-information-fill v-else color="var(--tsm-color-primary)" />
        </slot>
      </view>
      <view class="tsm-message-center">
        <text class="tsm-message-text">{{ messageValue }}</text>
      </view>
      <view class="tsm-message-right">
        <slot name="button" />
        <icon-close class="tsm-message-close" color="var(--tsm-color-text-secondary)" @tap="handleClose" />
      </view>
    </view>
  </tsm-transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MessageProps } from './props';
import { defaultProps } from './props';
import { addStyle, addUnit, bem } from '../../../libs/uniapp/function/index';

// 静态配置：由使用方通过 props 传入的配置
const props = withDefaults(defineProps<MessageProps>(), defaultProps);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

// 是否展示当前消息
const open = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

// 运行时配置：通过 show(options) 传入的临时配置，会覆盖 props 中的对应字段
const runtimeOptions = ref<Partial<MessageProps>>({});

// 合并 props 与运行时配置，优先使用 runtimeOptions
const topValue = computed(() => runtimeOptions.value.top ?? props.top);
const typeValue = computed(() => runtimeOptions.value.type ?? props.type);
const messageValue = computed(() => runtimeOptions.value.message ?? props.message);
const bgColorValue = computed(() => runtimeOptions.value.bgColor ?? props.bgColor);
const fontColorValue = computed(() => runtimeOptions.value.color ?? props.color);
const durationValue = computed(() => runtimeOptions.value.duration ?? props.duration);
const customStyleValue = computed(() => runtimeOptions.value.customStyle ?? props.customStyle);
const customClassValue = computed(() => runtimeOptions.value.customClass ?? props.customClass);

// BEM 类名，包含主题类型和外部自定义类名
const bemClass = computed(() => {
  return bem('message', [typeValue.value], [], customClassValue.value);
});

// 组件根节点的行内样式（背景色 / 字体色 / 自定义样式）
const customStyle = computed(() => {
  const style: Record<string, any> = {};
  if (bgColorValue.value) {
    style.backgroundColor = bgColorValue.value;
  }
  if (fontColorValue.value) {
    style.color = fontColorValue.value;
  }
  return addStyle({
    ...style,
    ...(customStyleValue.value || {}),
  });
});

// 容器样式：控制顶部距离与固定定位
const containerStyle = computed(() => {
  let top = 0;
  if (topValue.value === 0) {
    top = 44; // H5导航栏高度
  }
  return {
    top: addUnit(String(topValue.value === 0 ? top : topValue.value)),
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: 10076,
  };
});

// 清理定时器并关闭消息
const clearTimer = () => {
  open.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const handleClose = () => {
  clearTimer();
  emit('close');
};

// 对外暴露的展示方法
const show = (options: Partial<MessageProps>) => {
  clearTimer();
  runtimeOptions.value = { ...options };
  open.value = true;
  emit('open');
  if (durationValue.value > 0) {
    timer = setTimeout(() => {
      clearTimer();
      emit('close');
    }, durationValue.value);
  }
};

// 对外暴露方法，便于 ref 调用
defineExpose({ show, close: clearTimer });
</script>

<style scoped lang="scss">
.tsm-message {
  display: flex;
  box-sizing: border-box;
  margin: 0 auto;
  width: 343px;
  padding: var(--tsm-spacing-m) var(--tsm-spacing-m) var(--tsm-spacing-m) var(--tsm-spacing-xl);
  align-items: flex-start;
  gap: var(--tsm-spacing-2xs);
  border-radius: var(--tsm-radius-l);
  background: var(--tsm-color-bg-white);
  box-shadow:
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01),
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03);

  &-left {
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    align-items: center;
    .icon {
      width: 32px;
      height: 32px;
    }
  }

  &-text {
    width: 100%;
    overflow: hidden;
    color: var(--tsm-color-text-primary);
    text-overflow: ellipsis;

    /* Body/m */
    font-family: var(--tsm-font-family-regular);
    font-size: var(--tsm-font-size-text-m);
    font-style: normal;
    font-weight: var(--tsm-font-weight-regular);
    line-height: var(--tsm-line-height-text-m); /* 157.143% */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  &-center {
    min-height: 32px;
    max-width: 220px;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  &-right {
    margin-left: 8px;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  &-close {
    display: flex;
    width: 16px;
    height: 16px;
    justify-content: center;
    align-items: center;
  }
}
</style>
