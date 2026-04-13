/** * Segmented 分段器组件 * @description 分段器组件，用于切换选项 */
<template>
  <view class="tsm-segmented" :class="bemClass" :style="customStyle">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="tsm-segmented__item"
      :class="{ 'tsm-segmented__item--active': value === index }"
      @tap="onSelect(index)"
    >
      <text class="tsm-segmented__item__text" :style="{ color: value === index ? '#ffffff' : inactiveColor }">
        {{ item.text || item }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SegmentedProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<SegmentedProps>(), defaultProps);

const emit = defineEmits<{
  change: [index: number];
  'update:value': [value: number];
}>();

const bemClass = computed(() => {
  return bem('segmented', [], [], props.customClass);
});

const onSelect = (index: number) => {
  emit('update:value', index);
  emit('change', index);
};
</script>

<style scoped lang="scss">
.tsm-segmented {
  display: flex;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 2px;
}

.tsm-segmented__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.tsm-segmented__item--active {
  background-color: #2979ff;
}

.tsm-segmented__item__text {
  font-size: 14px;
  white-space: nowrap;
}
</style>
