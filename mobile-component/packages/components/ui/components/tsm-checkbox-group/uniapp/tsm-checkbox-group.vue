/** * CheckboxGroup 复选框组组件 * @description 复选框组组件，用于多选场景 */
<template>
  <view class="tsm-checkbox-group" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { CheckboxGroupProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<CheckboxGroupProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: (string | number)[]];
  'update:modelValue': [value: (string | number)[]];
}>();

const bemClass = computed(() => {
  return bem('checkbox-group', [props.placement], [], props.customClass);
});

// 向子组件提供组配置
provide('checkboxGroup', {
  props,
  updateValue: (name: string | number, checked: boolean) => {
    const newValue = [...(props.modelValue || [])];
    if (checked) {
      if (!newValue.includes(name)) {
        newValue.push(name);
      }
    } else {
      const index = newValue.indexOf(name);
      if (index > -1) {
        newValue.splice(index, 1);
      }
    }
    emit('update:modelValue', newValue);
    emit('change', newValue);
  },
});
</script>

<style scoped lang="scss">
.tsm-checkbox-group {
  display: flex;
  flex-wrap: wrap;
}

.tsm-checkbox-group--row {
  flex-direction: row;
}

.tsm-checkbox-group--column {
  flex-direction: column;
}
</style>
