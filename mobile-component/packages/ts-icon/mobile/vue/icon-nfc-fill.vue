<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M19 3a2 2 0 0 1 1.995 1.85L21 5v14a2 2 0 0 1-1.85 1.995L19 21H5a2 2 0 0 1-1.995-1.85L3 19V5a2 2 0 0 1 1.85-1.995L5 3zm-2.34 9.826c-.979 0-1.77.396-2.19 1.114-.214.363-.318.798-.318 1.296 0 1.393 1.004 2.293 2.54 2.293.374 0 .683-.028.961-.104.218-.06.347-.272.347-.498 0-.23-.259-.378-.477-.31a2.2 2.2 0 0 1-.63.097l-.143-.007c-.518-.032-.992-.278-1.27-.719a1.4 1.4 0 0 1-.207-.752c0-1.069.609-1.593 1.51-1.593q.383 0 .81.11c.2.052.407-.09.407-.297 0-.23-.133-.442-.355-.502a4 4 0 0 0-.986-.128m-7.264.085a.526.526 0 0 0-.526.526v3.056h-.084l-.872-2.887A.979.979 0 0 0 6 13.89v3.032a.525.525 0 0 0 1.05 0v-3h.038l.98 3.172a.5.5 0 0 0 .478.352h.874a.5.5 0 0 0 .5-.5v-3.508a.525.525 0 0 0-.524-.526m2.298 0a1 1 0 0 0-1 1v3a.535.535 0 0 0 1.07 0v-1.325h1.262a.408.408 0 1 0 0-.816h-1.262v-.985h1.5a.437.437 0 0 0 0-.874zM12 9a4 4 0 0 0-2.634.99 1 1 0 1 0 1.317 1.505A2 2 0 0 1 12 11c.485-.001.953.175 1.317.495a.999.999 0 0 0 1.664-.817 1 1 0 0 0-.347-.688A4 4 0 0 0 12 9m0-3a6.98 6.98 0 0 0-4.61 1.732 1 1 0 0 0 1.318 1.505C9.618 8.438 10.788 7.998 12 8a4.98 4.98 0 0 1 3.292 1.237 1.001 1.001 0 0 0 1.318-1.505A6.98 6.98 0 0 0 12 6" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-nfc-fill/nfc_fill.png'
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