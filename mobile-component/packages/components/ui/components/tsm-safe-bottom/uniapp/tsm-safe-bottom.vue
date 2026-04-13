/** * SafeBottom 安全区域组件 * @description 安全区域组件，用于适配底部安全区域 */
<template>
  <view class="tsm-safe-bottom" :class="[customClass]" :style="safeBottomStyle"></view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SafeBottomProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';

/**
 * SafeBottom 组件 Props
 * @property {string} bgColor - 背景颜色
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<SafeBottomProps>(), defaultProps);

const safeBottomStyle = computed(() => {
  // #ifdef APP-PLUS || H5
  const safeAreaInsets = uni.getSystemInfoSync().safeAreaInsets;
  const height = safeAreaInsets?.bottom || 0;
  return addStyle({
    height: `${height}px`,
    backgroundColor: props.bgColor,
    ...props.customStyle,
  });
  // #endif
  // #ifndef APP-PLUS || H5
  return addStyle({
    height: '0px',
    backgroundColor: props.bgColor,
    ...props.customStyle,
  });
  // #endif
});
</script>

<style scoped lang="scss">
.tsm-safe-bottom {
  width: 100%;
}
</style>
