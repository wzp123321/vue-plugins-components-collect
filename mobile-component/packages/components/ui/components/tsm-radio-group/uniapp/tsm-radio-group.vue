/** * RadioGroup 单选框组组件 * @description 单选框组组件，用于单选场景 */
<template>
  <view class="tsm-radio-group" :class="[customClass, `tsm-radio-group--${placement}`]" :style="groupStyleObj">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { RadioGroupProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * RadioGroup 组件 Props
 * @property {string|number} modelValue - 选中项的名称
 * @property {boolean} disabled - 是否禁用所有单选框
 * @property {string} shape - 单选框形状 (circle | square)
 * @property {string} activeColor - 选中时的颜色
 * @property {string} inactiveColor - 未选中时的颜色
 * @property {number|string} size - 单选框大小
 * @property {number|string} iconSize - 图标大小
 * @property {string} iconColor - 图标颜色
 * @property {string} labelColor - 标签文字颜色
 * @property {number|string} labelSize - 标签文字大小
 * @property {boolean} labelDisabled - 是否禁用标签点击
 * @property {string} placement - 排列方向 (row | column)
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<RadioGroupProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: string | number];
  'update:modelValue': [value: string | number];
}>();

const groupStyleObj = computed(() => {
  return addStyle(props.customStyle || {});
});

// 向子组件提供组配置
provide('radioGroup', {
  props,
  updateValue: (name: string | number) => {
    if (props.modelValue !== name) {
      emit('update:modelValue', name);
      emit('change', name);
    }
  },
});
</script>

<style scoped lang="scss">
.tsm-radio-group {
  display: flex;
  flex-wrap: wrap;
}

.tsm-radio-group--row {
  flex-direction: row;
}

.tsm-radio-group--column {
  flex-direction: column;
}
</style>
