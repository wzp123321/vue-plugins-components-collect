<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 2c.937 0 1.85.108 2.726.311a1 1 0 1 1-.452 1.948 10 10 0 0 0-1.499-.23l-.074-.002a8.95 8.95 0 0 1 4.341 1.517l.606-.606a.999.999 0 1 1 1.415 1.414l-.495.495a9 9 0 1 1-7.16-2.827l-.136.006a10 10 0 0 0-1.546.233 1 1 0 0 1-.452-1.948C10.15 2.108 11.064 2 12 2m0 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14m0 2a1 1 0 0 1 .993.883L13 9v4a1 1 0 0 1-1.993.117L11 13V9a1 1 0 0 1 1-1"/></svg>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
</style>