<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M19 3a3 3 0 0 1 2.995 2.824L22 6v10a3 3 0 0 1-2.824 2.995L19 19h-3.697l-2.61 1.74a1.25 1.25 0 0 1-1.257.075l-.13-.075L8.698 19H5a3 3 0 0 1-2.995-2.824L2 16V6a3 3 0 0 1 2.824-2.995L5 3zm0 2H5a1 1 0 0 0-.993.883L4 6v10a1 1 0 0 0 .883.993L5 17h3.697c.337 0 .67.085.965.248l.145.088L12 18.798l2.193-1.462a2 2 0 0 1 .941-.329l.169-.007H19a1 1 0 0 0 .993-.883L20 16V6a1 1 0 0 0-.883-.993zM8.5 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"/></svg>
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