<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M10.606 9.053a1 1 0 0 1 1.789.894l-.777 1.553H13.5a1 1 0 0 1 .895 1.447l-1.5 3a1 1 0 0 1-1.79-.894l.777-1.553H10a1 1 0 0 1-.895-1.447z"/><path fill="currentColor" fill-rule="evenodd" d="M12 5a7 7 0 0 1 7 7v5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2v-5a7 7 0 0 1 7-7M5 19v1h14v-1zm7-12a5 5 0 0 0-5 5v5h10v-5a5 5 0 0 0-5-5" clip-rule="evenodd"/><path fill="currentColor" d="M3 10a1 1 0 1 1 0 2H2a1 1 0 1 1 0-2zM22 10a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2zM4.293 4.293a1 1 0 0 1 1.414 0L6.414 5A1 1 0 1 1 5 6.414l-.707-.707a1 1 0 0 1 0-1.414M18.293 4.293a1 1 0 1 1 1.414 1.414L19 6.414A1 1 0 1 1 17.586 5zM12 1a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1"/></svg>
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