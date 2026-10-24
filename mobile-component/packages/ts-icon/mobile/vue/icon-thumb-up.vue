<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M18.632 8.037h-2.587c-.02 0-.035-.017-.03-.036.098-.348.506-1.984.106-3.606-.483-1.957-2.032-2.895-3.425-2.895-.755 0-1.463.275-1.932.812-1.335 1.53-.455 2.074-1.238 4.12-.67 1.75-2.267 2.222-2.714 2.322l-.122.024H4.5a3 3 0 0 0-3 3v7.347a3 3 0 0 0 3 3h11.979a4.5 4.5 0 0 0 4.379-3.463l1.423-6.011a3.75 3.75 0 0 0-3.649-4.614M3.375 19.125v-7.347c0-.62.505-1.125 1.125-1.125h1.125v9.597H4.5c-.62 0-1.125-.505-1.125-1.125m17.082-6.906-1.424 6.011a2.616 2.616 0 0 1-2.554 2.02H7.5v-9.738c.91-.26 2.884-1.075 3.778-3.41.434-1.136.48-1.947.515-2.539.032-.572.035-.619.384-1.018.091-.105.29-.17.518-.17.574 0 1.338.385 1.605 1.469.214.868.093 1.79-.006 2.29-.125.52-.405 1.188-.663 1.743a.75.75 0 0 0 .69 1.062l2.735-.027h1.576c.577 0 1.113.26 1.47.712.359.452.488 1.034.355 1.595"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-thumb-up/thumb_up.png'
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