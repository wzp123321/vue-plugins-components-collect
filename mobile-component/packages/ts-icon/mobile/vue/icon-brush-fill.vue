<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M14.33 2.307a3 3 0 0 1 2.12 3.674l-1.035 3.864 1.358.363c1.654.444 2.51 2.12 2.278 3.656-.11.729-.154 1.446-.065 1.968.185 1.084.808 2.146 1.458 3.073l.354.492A1 1 0 0 1 20 21H5.5c-.32 0-.627-.158-.813-.418-.49-.684-.838-1.458-1.125-2.244-.5-1.364-.917-3.293-.548-5.502a11.6 11.6 0 0 1 1.428-3.994c.655-1.108 1.93-1.42 2.99-1.136l2.188.586 1.035-3.864a3 3 0 0 1 3.675-2.121M7.978 15a1 1 0 0 0-.993 1.007c.007 1.024.327 2.005.669 2.77l.102.223h2.277a9 9 0 0 1-.392-.699c-.31-.617-.583-1.348-.644-2.047l-.012-.261A1 1 0 0 0 7.978 15m4.608-10.054-1.294 4.83a1 1 0 0 1-1.225.706l-3.152-.844c-.383-.103-.646.043-.751.221q-.42.715-.703 1.494l11.51 3.053c.025-.293.06-.578.1-.842.106-.69-.296-1.284-.817-1.424l-2.323-.622a1 1 0 0 1-.707-1.225l1.294-4.83a1 1 0 0 0-1.932-.517" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-brush-fill/brush_fill.png'
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