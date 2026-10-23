<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 2.083a9 9 0 0 1 9 9c0 3.074-1.676 5.59-3.442 7.395-.883.892-1.845 1.701-2.876 2.416l-.426.29-.2.133-.377.24-.336.205-.416.242a1.87 1.87 0 0 1-1.854 0l-.416-.242-.52-.32-.192-.125-.41-.273a20.6 20.6 0 0 1-3.093-2.566C4.676 16.672 3 14.158 3 11.083a9 9 0 0 1 9-9m0 2a7 7 0 0 0-7 7c0 2.322 1.272 4.36 2.871 5.996q1.033 1.046 2.222 1.91l.458.326q.222.155.427.288l.39.25.343.21.289.168.455-.269.367-.23q.293-.186.627-.417l.458-.326a18 18 0 0 0 2.222-1.91C17.728 15.444 19 13.405 19 11.083a7 7 0 0 0-7-7" clip-rule="evenodd"/><path fill="currentColor" d="M11.143 8.084a1 1 0 0 1 1.769.926l-.055.103-1.09 1.82h2.215c.746 0 1.221.772.92 1.427l-.054.102-1.99 3.318a1 1 0 0 1-1.77-.926l.055-.103 1.09-1.82h-2.215a1.01 1.01 0 0 1-.92-1.426l.054-.103z"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-hidden-danger/hidden_danger.png'
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