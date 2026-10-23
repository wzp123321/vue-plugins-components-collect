<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 2a4 4 0 0 1 4 4h2.035a2 2 0 0 1 1.999 1.929l.428 12A2 2 0 0 1 18.464 22H5.536a2 2 0 0 1-1.998-2.071l.428-12A2 2 0 0 1 5.965 6H8a4 4 0 0 1 4-4M8 8H5.965l-.43 12h12.929l-.43-12H16v1a1 1 0 0 1-1.993.117L14 9V8h-4v1a1 1 0 0 1-1.993.117L8 9zm4-4a2 2 0 0 0-1.995 1.85L10 6h4a2 2 0 0 0-2-2"/></svg>
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