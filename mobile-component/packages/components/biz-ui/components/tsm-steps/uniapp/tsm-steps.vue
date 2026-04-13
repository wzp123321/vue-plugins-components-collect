/** * Steps 步骤条组件 * @description 步骤条组件，用于显示流程步骤 */
<template>
  <view class="tsm-steps" :class="bemClass" :style="customStyle">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { StepsProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<StepsProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('steps', [props.direction], [], props.customClass);
});

provide('stepsContext', {
  props,
});
</script>

<style scoped lang="scss">
.tsm-steps {
  display: flex;
}

.tsm-steps--horizontal {
  flex-direction: row;
}

.tsm-steps--vertical {
  flex-direction: column;
}
</style>
