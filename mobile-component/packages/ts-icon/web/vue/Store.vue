<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M4.9 3.8A2 2 0 0 1 6.5 3h11a2 2 0 0 1 1.6.8l2.688 3.584a1 1 0 0 1 .204.616H22v1c0 1.014-.378 1.94-1 2.646V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.354A3.99 3.99 0 0 1 2 9V8h.008a1 1 0 0 1 .204-.616zm.1 9.074V19h14v-6.126a4.01 4.01 0 0 1-4-1.228c-.733.83-1.805 1.354-3 1.354s-2.267-.524-3-1.354a3.99 3.99 0 0 1-4 1.228M18 11a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2m-6 0a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2M8 9a2 2 0 1 1-4 0zm9.5-4h-11L5 7h14z" clip-rule="evenodd"/></svg>
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