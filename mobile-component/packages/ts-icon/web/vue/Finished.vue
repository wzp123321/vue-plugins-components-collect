<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M7.238 17.013a1 1 0 0 1 1.497 1.32l-.083.094-2.298 2.298a1.25 1.25 0 0 1-1.666.09l-.102-.09-1.237-1.238a1 1 0 0 1 1.32-1.497l.094.083.707.707 1.768-1.768M20 18a1 1 0 1 1 0 2h-9a1 1 0 0 1 0-2zM8.652 10.012a1 1 0 0 1 0 1.415l-2.298 2.298a1.25 1.25 0 0 1-1.768 0l-1.237-1.238a1 1 0 1 1 1.414-1.414l.707.707 1.768-1.767a1 1 0 0 1 1.414-.001M20 11a1 1 0 0 1 .117 1.993L20 13h-9a1 1 0 0 1-.116-1.993L11 11zM7.238 3.013a1 1 0 0 1 1.497 1.32l-.083.094-2.298 2.298a1.25 1.25 0 0 1-1.666.09l-.102-.09-1.237-1.238a1 1 0 0 1 1.32-1.497l.094.083.707.707zM20 4a1 1 0 0 1 .117 1.993L20 6h-9a1 1 0 0 1-.116-1.993L11 4z"/></svg>
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