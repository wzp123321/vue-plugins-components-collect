/** * Divider 分割线组件 * @description 分割线组件，用于分割内容 */
<template>
  <view class="tsm-divider" :class="bemClass" :style="customStyle">
    <view class="tsm-divider__line"></view>
    <view v-if="text" class="tsm-divider__text">{{ text }}</view>
    <view class="tsm-divider__line"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DividerProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<DividerProps>(), defaultProps);

const bemClass = computed(() => {
  return bem('divider', [props.contentPosition], [['dashed', props.dashed]], props.customClass);
});
</script>

<style scoped lang="scss">
.tsm-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 16px 0;
  border-color: #e4e7ed;
}

.tsm-divider__line {
  flex: 1;
  border-top: 1px solid;
  border-color: inherit;
}

.tsm-divider--dashed .tsm-divider__line {
  border-top-style: dashed;
}

.tsm-divider__text {
  padding: 0 12px;
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
}

.tsm-divider--left .tsm-divider__line:first-child {
  flex: none;
  width: 16px;
}

.tsm-divider--right .tsm-divider__line:last-child {
  flex: none;
  width: 16px;
}
</style>
