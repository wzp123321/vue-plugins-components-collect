<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M13 16.627V19h2c.185 0 .365.052.52.147l.332.331A1 1 0 0 1 15 21H9a1 1 0 0 1 0-2h2v-4.373zM3.293 2.293a1 1 0 0 1 1.414 0L5.874 3.46a1 1 0 0 1 1.469.883 1 1 0 0 1-.118.467L8.7 6.287q.043-.022.087-.04a1 1 0 0 1 1.09.217 1 1 0 0 1 .177 1.177l1.476 1.476A1 1 0 0 1 13 10v.586l1.318 1.318A3 3 0 0 0 15 10c0-.829-.335-1.577-.879-2.121a1.001 1.001 0 0 1 1.415-1.415A5 5 0 0 1 17 10c0 1.274-.48 2.438-1.265 3.321l1.416 1.416a7 7 0 0 0 1.319-2.057c.352-.85.531-1.76.53-2.68a6.98 6.98 0 0 0-2.05-4.95 1 1 0 0 1 1.414-1.414A8.98 8.98 0 0 1 21 10a8.98 8.98 0 0 1-2.434 6.152l2.141 2.14a1 1 0 0 1-1.414 1.415l-1.321-1.321a1.2 1.2 0 0 0-.159-.2l-14-14a1.2 1.2 0 0 0-.2-.159l-.32-.32a1 1 0 0 1 0-1.414M5.114 8.74A6.976 6.976 0 0 0 7.05 14.95a1 1 0 0 1-1.414 1.414A8.98 8.98 0 0 1 3 10a9 9 0 0 1 .479-2.895zm4.779 4.779-.014.016a1.003 1.003 0 0 1-1.415 0 5 5 0 0 1-1.418-2.863z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-communication-interrup/communication_interrup.png'
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