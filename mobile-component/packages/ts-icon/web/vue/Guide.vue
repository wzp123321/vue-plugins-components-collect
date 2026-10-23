<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 2a1 1 0 0 1 1 1v1h3.586A2 2 0 0 1 18 4.586l1.707 1.707a1 1 0 0 1 0 1.414L18 9.414a2 2 0 0 1-1.414.586H13v1h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v3h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-3H7.414A2 2 0 0 1 6 16.414l-1.707-1.707a1 1 0 0 1 0-1.414L6 11.586A2 2 0 0 1 7.414 11H11v-1h-1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1m2 11H7.414l-1 1 1 1H14zm2.586-7H10v2h6.586l1-1z" clip-rule="evenodd"/></svg>
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