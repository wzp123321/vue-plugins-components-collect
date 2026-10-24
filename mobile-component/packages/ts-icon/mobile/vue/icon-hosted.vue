<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="m11.025 11.753.228.037.226.05 3.716.929c1.171.293 1.76 1.527 1.39 2.64l.32-.22.646-.462c.325-.23.657-.449 1.002-.62 1.536-.769 3.334.29 3.442 1.97l.005.16v.055c0 .697-.3 1.357-.82 1.814l-.147.12-3.07 2.302a3 3 0 0 1-.994.49l-.218.052-3.21.642a5 5 0 0 1-2.964-.314l-.252-.117-2.35-1.175a1 1 0 0 0-.331-.1L7.528 20h-.796a2 2 0 0 1-1.563.993L5 21H4a2 2 0 0 1-1.995-1.85L2 19v-4a2 2 0 0 1 1.85-1.994L4 13h1c.484 0 .928.172 1.274.459l.125.112 1.99-1.243a4 4 0 0 1 2.636-.575m-.03 2.027a2 2 0 0 0-1.546.244L7 15.554V18h.528c.466 0 .926.109 1.342.317l2.35 1.175a3 3 0 0 0 1.93.258l3.21-.642a1 1 0 0 0 .403-.18l3.07-2.303c.128-.096.167-.237.167-.389a.383.383 0 0 0-.513-.359l-2.428 1.62a3 3 0 0 1-1.665.503H12v-2h1.559a1 1 0 0 0 .948-.684l.203-.608zM4 19h1v-4H4zM19 3.5a2 2 0 0 1 2 2V10a2 2 0 0 1-2 2h-3a1 1 0 1 1 0-2h3V5.5H5V10a1 1 0 1 1-2 0V5.5a2 2 0 0 1 2-2zm-9 3a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2z"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-hosted/hosted.png'
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