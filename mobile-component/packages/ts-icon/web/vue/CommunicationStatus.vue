<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 9a1 1 0 0 1 1 1v9h2a1 1 0 0 1 0 2H9a1 1 0 1 1 0-2h2v-9a1 1 0 0 1 1-1M7.05 3.636a1 1 0 0 1 0 1.414A6.98 6.98 0 0 0 5 10c0 1.933.782 3.682 2.05 4.95a1 1 0 0 1-1.414 1.414A8.98 8.98 0 0 1 3 10a8.98 8.98 0 0 1 2.636-6.364 1 1 0 0 1 1.414 0m11.314 0A8.98 8.98 0 0 1 21 10a8.98 8.98 0 0 1-2.636 6.364 1 1 0 0 1-1.414-1.414A6.97 6.97 0 0 0 19 10a6.97 6.97 0 0 0-2.05-4.95 1 1 0 0 1 1.414-1.414M9.879 6.464a1 1 0 0 1 0 1.415A2.99 2.99 0 0 0 9 10c0 .829.335 1.577.879 2.121a1.002 1.002 0 0 1-.707 1.708 1 1 0 0 1-.708-.293A4.99 4.99 0 0 1 7 10c0-1.38.56-2.632 1.464-3.536a1 1 0 0 1 1.415 0m5.657 0A4.99 4.99 0 0 1 17 10c0 1.38-.56 2.632-1.464 3.536a1 1 0 0 1-1.415 0 1 1 0 0 1 0-1.415A2.99 2.99 0 0 0 15 10c0-.829-.335-1.577-.879-2.12a1 1 0 0 1 1.415-1.416"/></svg>
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