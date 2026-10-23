<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 16a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5"/><path fill="currentColor" fill-rule="evenodd" d="M12.75 2h-1.5a.75.75 0 0 0-.75.75v.154c-1.991.416-3.583 1.643-4.21 3.221H5.25a.75.75 0 0 0 0 1.5H6v3.125h-.75a.75.75 0 0 0-.75.75v3.674a.75.75 0 0 0 .75.75H6v4.326h-.5a1 1 0 0 0-1 1v.25a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-.25a1 1 0 0 0-1-1H18v-4.326h.75a.75.75 0 0 0 .75-.75V11.5a.75.75 0 0 0-.75-.75H18V7.625h.685a.75.75 0 1 0 0-1.5h-.974c-.628-1.578-2.22-2.805-4.211-3.221V2.75a.75.75 0 0 0-.75-.75M12 17.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-hydrant-fill/hydrant_fill.png'
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