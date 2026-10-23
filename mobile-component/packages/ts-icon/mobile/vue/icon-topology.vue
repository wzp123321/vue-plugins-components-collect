<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 3a4 4 0 0 1 3.153 6.461l2.085 3.612A4 4 0 1 1 14.535 19h-5.07a4 4 0 1 1-2.703-5.927L8.847 9.46A4 4 0 0 1 12 3M6 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4m12 0a2.002 2.002 0 0 0-1.847 2.766A2.001 2.001 0 1 0 18 15m-4.448-4.312A4 4 0 0 1 12 11c-.55 0-1.074-.111-1.552-.312l-1.876 3.249A3.99 3.99 0 0 1 10 17h4c0-1.23.556-2.33 1.428-3.063zM12 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-topology/topology.png'
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