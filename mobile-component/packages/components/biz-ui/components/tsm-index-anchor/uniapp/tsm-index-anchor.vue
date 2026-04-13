/** * IndexAnchor 索引锚点组件 * @description 索引锚点组件，用于显示索引标题 */
<template>
  <view class="tsm-index-anchor" :class="bemClass" :style="customStyle">
    <text class="tsm-index-anchor__text">{{ index }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { IndexAnchorProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

/**
 * IndexAnchor 组件 Props
 * @property {string} index - 锚点索引
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<IndexAnchorProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('index-anchor', [], [], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-index-anchor {
  padding: 8px 16px;
  background-color: #f7f8fa;
}

.tsm-index-anchor__text {
  font-size: 14px;
  font-weight: bold;
  color: #909399;
}
</style>
