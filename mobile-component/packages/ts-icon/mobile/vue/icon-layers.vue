<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M11.692 3.049a1 1 0 0 1 .714.037l9 4a1 1 0 0 1 0 1.828L18.963 10l2.443 1.086a1 1 0 0 1 0 1.828L18.963 14l2.443 1.086a1 1 0 0 1 0 1.828l-9 4a1 1 0 0 1-.812 0l-9-4a1 1 0 0 1 0-1.828L5.037 14l-2.443-1.086a1 1 0 0 1 0-1.828L5.037 10 2.594 8.914a1 1 0 0 1 0-1.828l9-4zm.714 13.865a1 1 0 0 1-.812 0L7.5 15.094 5.463 16 12 18.905 18.537 16l-2.037-.906zm0-4a1 1 0 0 1-.812 0L7.5 11.094 5.463 12 12 14.905 18.537 12l-2.037-.906zM5.463 8 12 10.905 18.537 8 12 5.094z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-layers/layers.png'
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