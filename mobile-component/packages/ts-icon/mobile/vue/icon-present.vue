<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M8.667 2c1.34 0 2.538.608 3.333 1.564A4.32 4.32 0 0 1 15.333 2h.067A2.6 2.6 0 0 1 18 4.6c0 .5-.108.973-.3 1.4h.3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h.3c-.192-.427-.3-.9-.3-1.4A2.6 2.6 0 0 1 8.6 2zM19 14h-6v5h5a1 1 0 0 0 .993-.883L19 18zm-8 0H5v4a1 1 0 0 0 1 1h5zm0-6H6a1 1 0 0 0-.993.883L5 9v3h6zm7 0h-5v4h6V9a1 1 0 0 0-1-1M8.667 4H8.6a.6.6 0 0 0-.6.6A1.4 1.4 0 0 0 9.4 6h1.576a2.334 2.334 0 0 0-2.309-2M15.4 4h-.067c-1.12 0-2.055.788-2.28 1.84l-.03.16H14.6A1.4 1.4 0 0 0 16 4.6a.6.6 0 0 0-.503-.592z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-present/present.png'
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