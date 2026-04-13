/** * Loadmore 加载更多组件 * @description 加载更多组件，用于列表底部加载提示 */
<template>
  <view class="tsm-loadmore" :class="[customClass]" :style="loadmoreStyle">
    <view class="tsm-loadmore__line" v-if="status !== 'nomore'"></view>
    <tsm-loading-icon v-if="status === 'loading'" :size="16" color="#909399" />
    <text class="tsm-loadmore__text">{{ loadmoreText }}</text>
    <view class="tsm-loadmore__line" v-if="status !== 'nomore'"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LoadmoreProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * Loadmore 组件 Props
 * @property {string} status - 加载状态 (loadmore | loading | nomore)
 * @property {string} loadmoreText - 加载更多文字
 * @property {string} loadingText - 加载中文字
 * @property {string} nomoreText - 没有更多文字
 * @property {boolean} isDot - 是否虚线
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<LoadmoreProps>(), defaultProps);

const loadmoreStyle = computed(() => {
  return addStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 0',
    ...props.customStyle,
  });
});

const loadmoreText = computed(() => {
  if (props.status === 'loadmore') return props.loadmoreText;
  if (props.status === 'loading') return props.loadingText;
  return props.nomoreText;
});
</script>

<style scoped lang="scss">
.tsm-loadmore {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.tsm-loadmore__line {
  flex: 1;
  height: 1px;
  background-color: #dcdfe6;
}

.tsm-loadmore__text {
  margin: 0 8px;
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
}
</style>
