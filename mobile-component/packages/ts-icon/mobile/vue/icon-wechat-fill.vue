<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M16 10c3.154 0 6 2.186 6 5.213 0 1.696-.92 3.153-2.26 4.08-.044.265-.008.532-.008.799a.903.903 0 0 1-.897.908c-.68 0-1.31-.224-1.843-.645q-.494.07-.992.071c-3.154 0-6-2.186-6-5.213S12.846 10 16 10M9.5 3c3.777 0 7.149 2.535 7.474 6.062A8 8 0 0 0 16 9c-3.533 0-7 2.473-7 6.209q0 .531.09 1.027a9 9 0 0 1-.926-.094c-.67.549-1.443.858-2.31.858-.518 0-.937-.434-.937-.97l.004-.197.017-.397a2.1 2.1 0 0 0-.055-.59C3.17 13.667 2 11.794 2 9.624 2 5.807 5.525 3 9.5 3M14 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2M7 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2m5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-wechat-fill/wechat_fill.png'
<!-- #endif -->

const props = defineProps({
  size: { type: [String, Number], default: 22 },
  color: { type: String, default: '' },
  hoverClass: { type: String, default: '' }
})

const iconSize = computed(() => {
  const size = props.size
  if (typeof size === 'number') return size + 'px'
  return size.endsWith('px') ? size : size + 'px'
})

const iconColor = computed(() => props.color || 'currentColor')

const iconStyle = computed(() => ({
  '--icon-size': iconSize.value,
  '--icon-color': iconColor.value
}))

const emit = defineEmits(['click'])
function onTap() {
  emit('click')
}
</script>

<style scoped lang="scss">
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size, 22px);
  height: var(--icon-size, 22px);
  color: var(--icon-color, currentColor);
}
.icon :deep(svg) {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  color: inherit;
}
.icon-image {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}
</style>