<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M11.5 9a1 1 0 1 0 0-2H9V5.207C9 3.87 7.384 3.2 6.44 4.147l-4.796 4.79a1.5 1.5 0 0 0 0 2.123l4.794 4.793c.945.945 2.56.275 2.56-1.061V13H16a1 1 0 0 0 1-1v-1.587L20.586 14 17 17.586V16a1 1 0 0 0-1-1h-3.5a1 1 0 0 0 0 2H15v1.793c0 1.336 1.615 2.005 2.56 1.06l4.794-4.793a1.5 1.5 0 0 0 0-2.121L17.56 8.146C16.615 7.2 15 7.87 15 9.206V11H8a1 1 0 0 0-1 1v1.586L3.413 10 7 6.414V8a1 1 0 0 0 1 1z" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-transfer-horizontal-line/transfer_horizontal_line.png'
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