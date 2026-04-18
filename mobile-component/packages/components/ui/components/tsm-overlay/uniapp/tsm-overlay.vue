/** * Overlay 遮罩层组件 * @description 遮罩层组件，用于覆盖在页面上 */
<template>
  <tsm-transition :show="show" mode="fade" :duration="duration">
    <view class="tsm-overlay" :class="[customClass]" :style="overlayStyle" @tap="onClick"></view>
  </tsm-transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { OverlayProps } from './props';
import { defaultProps } from './props';
import { addStyle } from '../../../libs/uniapp/function/index';
import TsmTransition from '../../tsm-transition/uniapp/tsm-transition.vue';

/**
 * Overlay 组件 Props
 * @property {boolean} show - 是否显示
 * @property {number} zIndex - 层级
 * @property {number} duration - 动画时长
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<OverlayProps>(), defaultProps);

const emit = defineEmits<{
  click: [];
}>();

const overlayStyle = computed(() => {
  return addStyle({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: props.zIndex,
    backgroundColor: `var(--tsm-color-overlay-mask)`,
    ...props.customStyle,
  });
});
let originalOverflow = '';
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      //打开时，设置body的overflow为hidden,避免穿透滚动。并记录body的overflow的原始值
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      //关闭时，恢复body的overflow的原始值
      document.body.style.overflow = originalOverflow;
    }
  }
);

const onClick = () => {
  emit('click');
};
</script>

<style scoped lang="scss">
.tsm-overlay {
  width: 100%;
  height: 100%;
}
</style>
