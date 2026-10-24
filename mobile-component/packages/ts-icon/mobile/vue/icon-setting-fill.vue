<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4"/><path fill="currentColor" fill-rule="evenodd" d="M10.539 2.635a2 2 0 0 1 2.923 0l1.675 1.792 2.453-.083a2 2 0 0 1 2.065 2.067l-.082 2.453 1.792 1.675a2 2 0 0 1 0 2.923l-1.792 1.675.082 2.452a2 2 0 0 1-2.066 2.066l-2.452-.082-1.675 1.792a2 2 0 0 1-2.923 0l-1.675-1.792-2.453.082a2 2 0 0 1-2.067-2.065l.083-2.453-1.792-1.675a2 2 0 0 1 0-2.923l1.792-1.675-.083-2.453a2 2 0 0 1 2.067-2.067l2.453.083zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-setting-fill/setting_fill.png'
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