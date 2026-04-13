/** * Popover 弹出气泡组件 * @description 弹出气泡组件，用于显示弹出内容 */
<template>
  <view class="tsm-popover" :class="bemClass">
    <view class="tsm-popover__reference" @tap="onToggle">
      <slot name="reference" />
    </view>
    <view v-if="show" class="tsm-popover__content" :class="[`tsm-popover--${placement}`]" :style="customStyle">
      <view v-if="title" class="tsm-popover__title">{{ title }}</view>
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PopoverProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<PopoverProps>(), defaultProps);

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const bemClass = computed(() => {
  return bem('popover', [], [], props.customClass);
});

const onToggle = () => {
  emit('update:show', !props.show);
};
</script>

<style scoped lang="scss">
.tsm-popover {
  position: relative;
  display: inline-block;
}

.tsm-popover__content {
  position: absolute;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  z-index: 1000;
}

.tsm-popover--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.tsm-popover--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.tsm-popover--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.tsm-popover--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

.tsm-popover__title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}
</style>
