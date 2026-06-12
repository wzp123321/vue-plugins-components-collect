<!--
 * @Author: liuguanqi liugq@tiansu-china.com
 * @Date: 2026-04-28 17:31:00
 * @LastEditors: liuguanqi liugq@tiansu-china.com
 * @LastEditTime: 2026-05-18 18:51:32
 * @FilePath: \ts-mobile-ui\packages\components\ui\components\tsm-checkbox-group\uniapp\tsm-checkbox-group.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
  change: [detail: { value: (string | number)[] }];
  'update:modelValue': [value: (string | number)[]];
}>();

const bemClass = computed(() => {
  return bem('checkbox-group', [props.placement], [], props.customClass);
});

// 向子组件提供组配置
provide('checkboxGroup', {
  props,
  updateValue: (name: string | number, checked: boolean) => {
    if (props.readonly) return;
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
    emit('change', { value: newValue });
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
  align-items: center;
  justify-content: flex-start;
  gap: var(--tsm-spacing-3xl, 20px);
}

.tsm-checkbox-group--column {
  flex-direction: column;
}
</style>
