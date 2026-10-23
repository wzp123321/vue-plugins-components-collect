<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M9 3a1 1 0 0 1 .993.883L10 4v1h4a1 1 0 0 1 .116 1.993L14 7h-1.055c-.223 2.032-1.116 3.99-2.545 5.688q.785.682 1.735 1.266l.386.228 2.067-4.592a1 1 0 0 1 1.763-.115l.06.115 4.5 10a1 1 0 0 1-1.77.924l-.053-.104L18.003 18h-5.007l-1.084 2.41a1 1 0 0 1-1.866-.711l.042-.11 1.61-3.576a15.2 15.2 0 0 1-2.7-1.894c-1.287 1.136-2.848 2.098-4.627 2.81a1 1 0 0 1-.743-1.857c1.557-.623 2.887-1.441 3.972-2.382a11.5 11.5 0 0 1-1.978-3.34 1 1 0 0 1 1.873-.702A9.4 9.4 0 0 0 9 11.244c.989-1.227 1.625-2.576 1.877-3.931L10.928 7H4a1 1 0 0 1-.117-1.993L4 5h4V4a1 1 0 0 1 1-1m8.103 13L15.5 12.437 13.898 16z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-language/language.png'
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