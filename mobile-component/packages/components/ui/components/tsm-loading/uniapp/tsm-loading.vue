/** * LoadingIcon 加载图标组件 * @description 加载图标组件，用于显示加载状态 */
<template>
  <view class="tsm-loading">
    <icon-loading class="tsm-loading-icon" />
    <text class="tsm-loading-text">加载中...</text>
  </view>
</template>

<script setup lang="ts">
import type { LoadingIconProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<LoadingIconProps>(), defaultProps);
</script>

<style scoped lang="scss">
.tsm-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tsm-loading-icon {
  margin-right: 4px;
  width: 20px;
  height: 20px;
  animation: rotate 1.5s linear infinite;
}

.tsm-loading-text {
  color: var(--var-tsm-color-text-quaternary, rgba(164, 167, 174, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-m, 14px);
  line-height: var(--var-tsm-line-height-text-m, 22px);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
