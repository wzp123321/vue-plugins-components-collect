/** * IndexList 索引列表组件 * @description 索引列表组件，用于显示带索引的列表 */
<template>
  <view class="tsm-index-list" :class="bemClass" :style="customStyle">
    <view class="tsm-index-list__content">
      <slot />
    </view>
    <view v-if="showIndexBar" class="tsm-index-list__bar">
      <slot name="index" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import type { IndexListProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * IndexList 组件 Props
 * @property {string} activeIndex - 当前选中的索引
 * @property {boolean} showIndexBar - 是否显示右侧索引栏
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<IndexListProps>(), defaultProps);

const emit = defineEmits<{
  select: [index: string];
}>();

const bemClass = computed(() => {
  return bem('index-list', [], [], props.customClass);
});

const onSelect = (index: string) => {
  emit('select', index);
};

provide('indexListContext', {
  props,
  onSelect,
});
</script>

<style scoped lang="scss">
.tsm-index-list {
  display: flex;
  width: 100%;
}

.tsm-index-list__content {
  flex: 1;
}

.tsm-index-list__bar {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}
</style>
