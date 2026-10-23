<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M14.999 3a1 1 0 1 0 0 2 4 4 0 0 1 4 4 1 1 0 1 0 2 0 6 6 0 0 0-6-6"/><path fill="currentColor" d="M15.106 6.053a1 1 0 1 0-.347 1.97 1.5 1.5 0 0 1 1.225 1.268 1 1 0 0 0 1.98-.278 3.5 3.5 0 0 0-2.858-2.96"/><path fill="currentColor" fill-rule="evenodd" d="M8.17 15.829c3.846 3.845 7.409 4.266 8.454 4.305 1.265.046 2.555-.986 3.112-2.043-.89-1.044-2.048-1.854-3.318-2.732-.748.748-1.671 2.138-2.9 1.64-.7-.281-2.425-1.076-3.934-2.585C8.076 12.906 7.281 11.18 7 10.482 6.5 9.25 7.894 8.326 8.643 7.577c-.877-1.29-1.674-2.479-2.716-3.324-1.071.56-2.11 1.84-2.062 3.121.038 1.046.46 4.609 4.305 8.455m8.38 6.304c-1.44-.053-5.52-.617-9.794-4.89-4.273-4.274-4.837-8.354-4.89-9.795-.08-2.196 1.601-4.329 3.545-5.162a1.47 1.47 0 0 1 1.445.159c1.607 1.173 2.717 2.95 3.67 4.342a1.504 1.504 0 0 1-.177 1.913l-1.357 1.357c.315.695.957 1.894 2.006 2.943 1.05 1.05 2.249 1.691 2.944 2.006l1.356-1.356a1.5 1.5 0 0 1 1.918-.171c1.42.984 3.087 2.077 4.304 3.634a1.47 1.47 0 0 1 .188 1.485c-.837 1.953-2.954 3.616-5.157 3.535" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-phone/phone.png'
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