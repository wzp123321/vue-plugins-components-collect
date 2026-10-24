<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M7.5 15a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"/><path fill="currentColor" fill-rule="evenodd" d="M16.5 12a4.501 4.501 0 0 1 .212 8.995L16.5 21h-9a4.5 4.5 0 0 1-.212-8.995L7.5 12zm-9 2a2.5 2.5 0 0 0-.164 4.995L7.5 19h9a2.5 2.5 0 0 0 .164-4.995L16.5 14z" clip-rule="evenodd"/><path fill="currentColor" d="M16.5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"/><path fill="currentColor" fill-rule="evenodd" d="M16.5 2a4.501 4.501 0 0 1 .212 8.995L16.5 11h-9a4.5 4.5 0 0 1-.212-8.995L7.5 2zm-9 2a2.5 2.5 0 0 0-.164 4.995L7.5 9h9a2.5 2.5 0 0 0 .164-4.995L16.5 4z" clip-rule="evenodd"/></svg>
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