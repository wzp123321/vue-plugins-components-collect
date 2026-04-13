/** * Collapse 折叠面板组件 * @description 折叠面板组件，用于折叠/展开内容区域 */
<template>
  <view class="tsm-collapse" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import type { CollapseProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * Collapse 组件 Props
 * @property {string|number|array} value - 当前展开的面板
 * @property {boolean} accordion - 是否手风琴模式
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<CollapseProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: string | number | (string | number)[]];
  'update:value': [value: string | number | (string | number)[]];
}>();

const bemClass = computed(() => {
  return bem('collapse', [], [], props.customClass);
});

const toggle = (name: string | number) => {
  let newValue: string | number | (string | number)[];

  if (props.accordion) {
    newValue = props.value === name ? '' : name;
  } else {
    const currentValue = Array.isArray(props.value) ? props.value : [props.value];
    if (currentValue.includes(name)) {
      newValue = currentValue.filter(item => item !== name);
    } else {
      newValue = [...currentValue, name];
    }
  }

  emit('update:value', newValue);
  emit('change', newValue);
};

provide('collapseContext', {
  props,
  toggle,
});
</script>

<style scoped lang="scss">
.tsm-collapse {
  width: 100%;
}
</style>
