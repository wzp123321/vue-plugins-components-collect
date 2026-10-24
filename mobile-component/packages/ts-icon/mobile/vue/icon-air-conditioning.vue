<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M18 4a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm0 2H6a1 1 0 0 0-.993.883L5 7v5a1 1 0 0 0 .883.993L6 13v-2a1 1 0 0 1 .883-.993L7 10h10a1 1 0 0 1 .993.883L18 11v2a1 1 0 0 0 .993-.883L19 12V7a1 1 0 0 0-.883-.993zm-2 6H8v1h8zm0-5a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-6 9a1 1 0 0 1 1 1v1.172a3 3 0 0 1-.879 2.12l-.414.415a1 1 0 0 1-1.414-1.414l.414-.414A1 1 0 0 0 9 18.172V17a1 1 0 0 1 1-1m3 1a1 1 0 1 1 2 0v1.172a1 1 0 0 0 .293.707l.414.414a1 1 0 1 1-1.414 1.414l-.414-.414A3 3 0 0 1 13 18.172zm-7-1a1 1 0 0 1 1 1v.613a2 2 0 0 1-1.368 1.897l-1.316.439a1 1 0 0 1-.632-1.898L5 17.613V17a1 1 0 0 1 1-1m11 1a1 1 0 1 1 2 0v.613l1.316.438a1 1 0 0 1-.632 1.898l-1.316-.44A2 2 0 0 1 17 17.614z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-air-conditioning/air_conditioning.png'
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