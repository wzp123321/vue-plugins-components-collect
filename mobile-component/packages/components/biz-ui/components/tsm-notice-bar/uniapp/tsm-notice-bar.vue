/** * NoticeBar 通知栏组件 * @description 通知栏组件，用于显示滚动通知 */
<template>
  <view class="tsm-notice-bar" :class="[customClass]" :style="noticeBarStyle">
    <icon-setting />
    <view class="tsm-notice-bar__content">
      <text class="tsm-notice-bar__text" :style="{ color: color }">{{ text }}</text>
    </view>
    <view v-if="showClose" class="tsm-notice-bar__close" @tap="onClose">
      <icon-setting />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NoticeBarProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * NoticeBar 组件 Props
 * @property {string} text - 通知文本
 * @property {number} speed - 滚动速度
 * @property {boolean} showIcon - 是否显示左侧图标
 * @property {boolean} showClose - 是否显示关闭按钮
 * @property {string} bgColor - 背景颜色
 * @property {string} color - 文字颜色
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<NoticeBarProps>(), defaultProps);

const emit = defineEmits<{
  close: [];
}>();

const noticeBarStyle = computed(() => {
  return addStyle({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: props.bgColor,
    ...props.customStyle,
  });
});

const onClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.tsm-notice-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.tsm-notice-bar__icon {
  margin-right: 8px;
}

.tsm-notice-bar__content {
  flex: 1;
  overflow: hidden;
}

.tsm-notice-bar__text {
  font-size: 14px;
  white-space: nowrap;
}

.tsm-notice-bar__close {
  margin-left: 8px;
}
</style>
