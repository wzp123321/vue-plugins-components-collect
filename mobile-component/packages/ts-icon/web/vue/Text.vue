<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M7 3a1 1 0 0 1 .993.883L8 4h8a1 1 0 0 1 .883-.993L17 3h3a1 1 0 0 1 .993.883L21 4v3a1 1 0 0 1-.883.993L20 8v8a1 1 0 0 1 .993.883L21 17v3a1 1 0 0 1-.883.993L20 21h-3a1 1 0 0 1-.993-.883L16 20H8a1 1 0 0 1-.883.993L7 21H4a1 1 0 0 1-.993-.883L3 20v-3a1 1 0 0 1 .883-.993L4 16V8a1 1 0 0 1-.993-.883L3 7V4a1 1 0 0 1 .883-.993L4 3zM6 18H5v1h1zm13 0h-1v1h1zM16 6H8v1a1 1 0 0 1-1 1H6v8h1a1 1 0 0 1 1 1v1h8v-1a1 1 0 0 1 1-1h1V8h-1a1 1 0 0 1-1-1zm-4 1a1.71 1.71 0 0 1 1.61 1.135l2.332 6.529a1 1 0 0 1-1.884.672L13.581 14h-3.162l-.477 1.336a1 1 0 0 1-1.884-.672l2.332-6.53A1.71 1.71 0 0 1 12 7m0 2.573L11.133 12h1.734zM6 5H5v1h1zm13 0h-1v1h1z" clip-rule="evenodd"/></svg>
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