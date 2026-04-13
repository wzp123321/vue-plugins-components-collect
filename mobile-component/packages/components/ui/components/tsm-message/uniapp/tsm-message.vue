/** * Message 消息提示组件 * @description 该组件一般用于页面顶部向下滑出一个提示，尔后自动收起的场景 */
<template>
  <tsm-transition mode="slide-down" :customStyle="containerStyle" :show="open">
    <view class="tsm-message" :class="[`tsm-message--${type}`]" :style="[backgroundColor, customStyleObj]">
      <tsm-status-bar v-if="safeAreaInsetTop"></tsm-status-bar>
      <view class="tsm-message__wrapper">
        <slot name="icon">
          <icon-setting />
        </slot>
        <text
          class="tsm-message__text"
          :style="{
            fontSize: addUnit(String(fontSize)),
            color: color,
          }"
          >{{ message }}</text
        >
      </view>
    </view>
  </tsm-transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { MessageProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle } from '../../../libs/uniapp/function/index';

/**
 * Message 组件 Props
 * @property {number|string} top - 到顶部的距离
 * @property {string} type - 主题类型 (primary | success | warning | error)
 * @property {string} color - 字体颜色
 * @property {string} bgColor - 背景颜色
 * @property {string} message - 展示的文字内容
 * @property {number} duration - 展示时长，为0时不消失，单位ms
 * @property {number|string} fontSize - 字体大小
 * @property {boolean} safeAreaInsetTop - 是否留出顶部安全距离
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<MessageProps>(), defaultProps);

const emit = defineEmits<{
  open: [];
  close: [];
}>();

const open = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const customStyleObj = computed(() => {
  return addStyle(props.customStyle || {});
});

const containerStyle = computed(() => {
  let top = 0;
  if (props.top === 0) {
    top = 44; // H5导航栏高度
  }
  return {
    top: addUnit(String(props.top === 0 ? top : props.top)),
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: 10076,
  };
});

const backgroundColor = computed(() => {
  const style: Record<string, any> = {};
  if (props.bgColor) {
    style.backgroundColor = props.bgColor;
  }
  return style;
});

const iconName = computed(() => {
  if (props.type === 'success') return 'checkmark-circle';
  if (props.type === 'error') return 'close-circle';
  if (props.type === 'warning') return 'error-circle';
  return '';
});

const clearTimer = () => {
  open.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const show = (options: Partial<MessageProps>) => {
  clearTimer();
  Object.assign(props, options);
  open.value = true;
  emit('open');
  if (props.duration > 0) {
    timer = setTimeout(() => {
      clearTimer();
      emit('close');
    }, props.duration);
  }
};

defineExpose({ show, close: clearTimer });
</script>

<style scoped lang="scss">
.tsm-message {
  padding: 8px 10px;
}

.tsm-message__wrapper {
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.tsm-message__text {
  font-size: 15px;
  text-align: center;
}

.tsm-message--primary {
  background-color: #2979ff;
}

.tsm-message--success {
  background-color: #19be6b;
}

.tsm-message--error {
  background-color: #fa3534;
}

.tsm-message--warning {
  background-color: #ff9900;
}
</style>
