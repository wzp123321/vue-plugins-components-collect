<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M3 5a2 2 0 0 1 2-2h2a1 1 0 0 1 0 2H5v2a1 1 0 0 1-2 0zm0 14a2 2 0 0 0 2 2h2a1 1 0 0 0 0-2H5v-2a1 1 0 1 0-2 0zM19 3a2 2 0 0 1 2 2v2a1 1 0 0 1-2 0V5h-2a1 1 0 1 1 0-2zm2 16a2 2 0 0 1-2 2h-2a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 2 0zM16.955 8.358a1 1 0 0 0-1.313-1.313l-9.9 4.243a1 1 0 0 0 .17 1.893l3.986.92.92 3.987a1 1 0 0 0 1.894.17zm-5.998 3.935-1.614-.372 4.789-2.053-2.053 4.79-.373-1.615a1 1 0 0 0-.749-.75" clip-rule="evenodd"/></svg>
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