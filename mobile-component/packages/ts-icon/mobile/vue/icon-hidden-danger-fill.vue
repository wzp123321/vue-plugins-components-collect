<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 2.083a9 9 0 0 1 9 9c0 3.074-1.676 5.59-3.442 7.396-.883.891-1.846 1.7-2.876 2.416l-.426.29-.2.132-.377.24-.336.206-.416.24a1.87 1.87 0 0 1-1.854 0l-.416-.24-.52-.32-.192-.126-.41-.273a20.6 20.6 0 0 1-3.093-2.565C4.676 16.673 3 14.157 3 11.083a9 9 0 0 1 9-9m-.083 5.519a1.001 1.001 0 0 0-.774.482l-1.99 3.317-.055.104a1.01 1.01 0 0 0 .92 1.427h2.215l-1.09 1.819-.055.103a1.002 1.002 0 0 0 1.77.926l1.99-3.318.054-.103a1 1 0 0 0 .091-.374 1.01 1.01 0 0 0-1.01-1.052h-2.216l1.09-1.82.055-.103a1 1 0 0 0-.995-1.408" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-hidden-danger-fill/hidden_danger_fill.png'
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