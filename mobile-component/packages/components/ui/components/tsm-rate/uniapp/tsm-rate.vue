/** * Rate 评分组件 * @description 评分组件，用于显示和选择评分 */
<template>
  <view class="tsm-rate" :class="bemClass" :style="customStyle">
    <view v-for="i in max" :key="i" class="tsm-rate__item" @tap="onSelect(i)">
      <icon-setting />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RateProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<RateProps>(), defaultProps);

const emit = defineEmits<{
  change: [value: number];
  'update:value': [value: number];
}>();

const bemClass = computed(() => {
  return bem('rate', [props.disabled ? 'disabled' : ''], [], props.customClass);
});

const onSelect = (value: number) => {
  if (props.disabled) return;
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped lang="scss">
.tsm-rate {
  display: flex;
  align-items: center;
}

.tsm-rate--disabled {
  opacity: 0.5;
}

.tsm-rate__item {
  margin-right: 4px;
}
</style>
