<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><g fill="currentColor"><path d="M14 15a1 1 0 0 1 0 2h-4a1 1 0 1 1 0-2z"/><g fill-rule="evenodd" clip-rule="evenodd"><path d="M15.5 6a1.5 1.5 0 0 1 1.493 1.356L17 7.5v2a1.5 1.5 0 0 1-1.356 1.493L15.5 11h-7a1.5 1.5 0 0 1-1.493-1.356L7 9.5v-2a1.5 1.5 0 0 1 1.356-1.493L8.5 6zM9 9h6V8H9z"/><path d="M18 2a2 2 0 0 1 1.995 1.85L20 4v16a2 2 0 0 1-1.85 1.995L18 22H6a2 2 0 0 1-1.995-1.85L4 20v-1a1 1 0 0 1-.117-1.993L4 17v-2a1 1 0 0 1-.117-1.993L4 13v-2a1 1 0 0 1-.117-1.993L4 9V7a1 1 0 0 1-.117-1.993L4 5V4a2 2 0 0 1 1.85-1.995L6 2zM6 20h12V4H6z"/></g></g></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-memo/memo.png'
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