/** * Steps 步骤条组件 * @description 步骤条组件，用于显示流程步骤 */
<template>
  <view class="tsm-steps" :class="bemClass" :style="customStyle">
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, type Ref, ref } from 'vue';
import type { StepsProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';
const props = withDefaults(defineProps<StepsProps>(), defaultProps);
// 总项数
const totalItems = ref(1);
/** 步骤项列表 */
const stepItems = ref<{ text: string; description: string; status: string }[]>([]);
provide('stepsContext', {
  props,
  totalItems: totalItems,
  stepItems: stepItems,
  setItemIndex: (itemIndex: Ref<number>) => {
    itemIndex.value = totalItems.value++;
  },
  registerItem: (item: { text: string; description: string; status: string }) => {
    stepItems.value.push(item);
  },
});

const bemClass = computed(() => {
  return bem('steps', [props.direction, props.simple ? 'simple' : ''], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-steps {
  display: flex;
  width: 100%;
}
.tsm-steps--vertical {
  flex-direction: column;
  height: 100%;
}
</style>
