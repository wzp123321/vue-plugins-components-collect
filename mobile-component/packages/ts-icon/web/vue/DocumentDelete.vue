<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><g fill="currentColor"><path d="M9.875 11.867a1 1 0 0 1 .71.305L12 13.586l1.414-1.414a.999.999 0 0 1 1.708.707 1 1 0 0 1-.293.707L13.414 15l1.415 1.414a.999.999 0 0 1-1.09 1.63 1 1 0 0 1-.325-.216L12 16.414l-1.414 1.414a1 1 0 1 1-1.414-1.414L10.586 15l-1.414-1.414a1 1 0 0 1 .703-1.719"/><path fill-rule="evenodd" d="M13.586 2a2 2 0 0 1 1.284.467l.13.119L19.414 7c.332.332.537.77.578 1.238l.008.176V20a2 2 0 0 1-1.85 1.995L18 22H6a2 2 0 0 1-1.995-1.85L4 20V4a2 2 0 0 1 1.85-1.995L6 2zM6 20h12V10h-4.5A1.5 1.5 0 0 1 12 8.5V4H6zm8-12h3.586L14 4.414z" clip-rule="evenodd"/></g></svg>
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