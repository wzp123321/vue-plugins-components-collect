<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M16.243 9.878a1 1 0 0 1 1.32-.083l.094.083L19.778 12a5.5 5.5 0 0 1-7.596 7.952L12 19.778l-2.121-2.121a1 1 0 0 1 1.32-1.498l.094.083 2.121 2.122a3.5 3.5 0 0 0 5.091-4.8l-.141-.15-2.121-2.121a1 1 0 0 1 0-1.415M9.17 9.171a1 1 0 0 1 1.32-.083l.095.083 4.242 4.243a1 1 0 0 1-1.32 1.497l-.094-.083-4.243-4.242a1 1 0 0 1 0-1.415m-4.95-4.95a5.5 5.5 0 0 1 7.597-.173l.182.174 2.121 2.12A1 1 0 0 1 12.8 7.84l-.094-.083-2.121-2.121a3.5 3.5 0 0 0-5.091 4.8l.141.15 2.121 2.12a1 1 0 0 1-1.32 1.498l-.094-.083L4.222 12a5.5 5.5 0 0 1 0-7.778z"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-link/link.png'
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