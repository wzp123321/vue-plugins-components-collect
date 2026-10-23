<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 4a9 9 0 1 1 0 18.001A9 9 0 0 1 12 4m0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14m0 2a1 1 0 0 1 .993.883L13 9v3.586l1.813 1.812a1 1 0 0 1-1.32 1.498l-.095-.084-2.105-2.105a1 1 0 0 1-.286-.59l-.007-.13V9a1 1 0 0 1 1-1m4.634-5.03a1 1 0 0 1 1.367-.364 12 12 0 0 1 3.271 2.776 1 1 0 0 1-1.544 1.27 10 10 0 0 0-2.729-2.315 1 1 0 0 1-.365-1.367M6 2.607a1 1 0 0 1 1.002 1.731 10 10 0 0 0-2.729 2.316 1 1 0 1 1-1.544-1.27A12 12 0 0 1 6 2.607"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-alarm-clock/alarm_clock.png'
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