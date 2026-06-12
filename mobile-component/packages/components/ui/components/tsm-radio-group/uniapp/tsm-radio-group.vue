<!--
 * @Author: liuguanqi liugq@tiansu-china.com
 * @Date: 2026-04-28 17:31:07
 * @LastEditors: liuguanqi liugq@tiansu-china.com
 * @LastEditTime: 2026-05-11 21:05:44
 * @FilePath: \ts-mobile-ui\packages\components\ui\components\tsm-radio-group\uniapp\tsm-radio-group.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
/** * RadioGroup 单选框组组件 * @description 单选框组组件，用于单选场景 */
<template>
  <view class="tsm-radio-group" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, provide, toRefs } from 'vue';
import type { RadioGroupProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<RadioGroupProps>(), defaultProps);

const emit = defineEmits<{
  'update:value': [value: string];
  change: [detail: { value: string }];
}>();

const bemClass = computed(() => {
  return bem('radio-group', [props.vertical ? 'vertical' : ''], [], props.customClass);
});

// 向子组件提供组配置（使用 toRefs 保持响应式）
const { value, disabled, readonly, vertical } = toRefs(props);

provide('radioGroup', {
  value,
  disabled,
  readonly,
  vertical,
  updateValue: (selectedValue: string) => {
    if (readonly.value) return;
    emit('update:value', selectedValue);
    emit('change', { value: selectedValue });
  },
});
</script>

<style scoped lang="scss">
.tsm-radio-group {
  display: flex;
  flex-wrap: wrap;
}

.tsm-radio-group--vertical {
  flex-direction: column;

  :deep(.tsm-radio) {
    margin-right: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
