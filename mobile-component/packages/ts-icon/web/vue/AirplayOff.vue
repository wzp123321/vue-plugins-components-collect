<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M15.985 20.612a1.01 1.01 0 0 1-.895 1.105l-.11.006H9.02a1.01 1.01 0 0 1-.881-1.505l.06-.093 2.979-4.168q.03-.045.067-.085zM2.293 2.293a1 1 0 0 1 1.414 0L5.414 4H20a2 2 0 0 1 1.995 1.85L22 6v11a2 2 0 0 1-1.623 1.963l.83.83a1 1 0 1 1-1.414 1.414l-17.5-17.5a1 1 0 0 1 0-1.414m8.651 17.43h2.112L12 18.247zM4 8.627V17h4v2H4a2 2 0 0 1-1.995-1.85L2 17V6.627zM18.414 17H20V6H7.414z" clip-rule="evenodd"/></svg>
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