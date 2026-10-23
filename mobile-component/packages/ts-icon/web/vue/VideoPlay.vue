<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16M8.964 8.65a1.192 1.192 0 0 1 1.654-.953l.325.143.44.202.349.169.39.196.43.223.462.251.494.28.249.145.469.282.428.268.564.368.464.318.455.328.083.061c.635.477.64 1.429.001 1.909l-.283.209-.393.276-.496.335-.387.25-.43.27-.473.283q-.123.073-.252.147l-.498.282-.466.253-.43.224-.39.196-.505.242-.4.181-.202.088a1.19 1.19 0 0 1-1.651-.954l-.054-.499-.03-.334-.042-.599-.024-.46-.018-.506-.01-.549v-.579l.01-.548.018-.506.024-.46.042-.599.071-.73zm1.884 1.355-.027.467-.021.525-.012.58v.618l.012.58.02.525.028.467.416-.21.226-.118.488-.262.53-.299.522-.309.242-.148.444-.28.39-.255-.392-.257-.444-.281-.496-.3a29 29 0 0 0-.793-.453l-.488-.262-.442-.227z" clip-rule="evenodd"/></svg>
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