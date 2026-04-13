/** * Gap 间隔槽组件 * @description 间隔槽组件，用于创建间距 */
<template>
  <view class="tsm-gap" :class="bemClass" :style="customStyle"></view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GapProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<GapProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('gap', [], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-gap {
  width: 100%;
}
</style>
