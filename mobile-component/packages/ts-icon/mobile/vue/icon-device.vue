<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M18.5 3.5a2 2 0 0 1 1.995 1.85l.005.15v4a2 2 0 0 1-1.85 1.995l-.15.005h-14a2 2 0 0 1-1.995-1.85L2.5 9.5v-4a2 2 0 0 1 1.85-1.995L4.5 3.5zm0 2h-14v4h14zm-9 1a1 1 0 0 1 .117 1.993L9.5 8.5h-2a1 1 0 0 1-.117-1.993L7.5 6.5zm9 6a2 2 0 0 1 1.995 1.85l.005.15v4a2 2 0 0 1-1.85 1.995l-.15.005h-14a2 2 0 0 1-1.995-1.85L2.5 18.5v-4a2 2 0 0 1 1.85-1.995l.15-.005zm0 2h-14v4h14zm-9 1a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2z"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-device/device.png'
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