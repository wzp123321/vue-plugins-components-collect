/** * BackTop 返回顶部组件 * @description 返回顶部组件，用于快速返回页面顶部 */
<template>
  <view v-if="visible" class="tsm-back-top" :class="bemClass" :style="customStyle" @tap="onClick">
    <text class="tsm-back-top__icon">↑</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BackTopProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<BackTopProps>(), defaultProps);

const emit = defineEmits<{
  click: [];
}>();

const bemClass = computed(() => {
  return bem('back-top', [], [], props.customClass);
});

const visible = computed(() => {
  return props.scrollTop >= props.top;
});

const onClick = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  });
  emit('click');
};
</script>

<style scoped lang="scss">
.tsm-back-top {
  position: fixed;
  right: 16px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
</style>
