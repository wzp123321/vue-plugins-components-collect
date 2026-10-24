<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M15.462 2.254a2 2 0 0 1 1.273.58l4.429 4.432a2 2 0 0 1 .186 2.614l-2.184 2.913a9 9 0 0 0-1.71 4.127l-.31 2.177c-.105.73-.892 1.265-1.662.914-.723-.331-2.629-1.386-5.72-4.36l-4.178 4.177a1 1 0 0 1-1.098.231 1 1 0 0 1-.316-1.645l4.178-4.178c-2.975-3.09-4.03-4.996-4.36-5.72-.352-.77.183-1.557.913-1.662l2.177-.31a9 9 0 0 0 4.127-1.71l2.913-2.185c.385-.289.862-.43 1.342-.395m-3.055 4.181a11 11 0 0 1-5.045 2.09l-1 .143c.624.98 1.838 2.602 4.102 4.868 2.266 2.266 3.888 3.48 4.869 4.104l.143-1.001c.262-1.83.98-3.565 2.09-5.044L19.75 8.68 15.32 4.25z" clip-rule="evenodd"/></svg>
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