/** * FormItem 表单项组件 * @description 表单项组件，用于表单中的每一项 */
<template>
  <view class="tsm-form-item" :class="bemClass" :style="customStyle">
    <view v-if="label" class="tsm-form-item__label" :style="{ width: addUnit(String(labelWidth)) }">
      <text v-if="required" class="tsm-form-item__required">*</text>
      <text>{{ label }}</text>
    </view>
    <view class="tsm-form-item__content">
      <slot />
    </view>
    <view v-if="error" class="tsm-form-item__error">
      <text>{{ error }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FormItemProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

/**
 * FormItem 组件 Props
 * @property {string} label - 标签文字
 * @property {number|string} labelWidth - 标签宽度
 * @property {boolean} required - 是否必填
 * @property {string} error - 错误信息
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<FormItemProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('form-item', [], [['error', !!props.error]], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-form-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #ebedf0;
}

.tsm-form-item--error {
  border-bottom-color: #fa3534;
}

.tsm-form-item__label {
  font-size: 14px;
  color: #303133;
  margin-right: 12px;
}

.tsm-form-item__required {
  color: #fa3534;
  margin-right: 2px;
}

.tsm-form-item__content {
  flex: 1;
}

.tsm-form-item__error {
  margin-top: 4px;
  font-size: 12px;
  color: #fa3534;
}
</style>
