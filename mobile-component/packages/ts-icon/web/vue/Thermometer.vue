<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 2a3 3 0 0 1 2.995 2.824L15 5v7.956l.01.021a.3.3 0 0 0 .087.097 5 5 0 1 1-6.193 0 .4.4 0 0 0 .068-.069l.028-.05V5a3 3 0 0 1 3-3m0 2a1 1 0 0 0-.993.883L11 5v7.958c0 .675-.337 1.226-.744 1.59l-.113.096a3 3 0 1 0 3.86.123l-.146-.123c-.418-.33-.79-.853-.849-1.505L13 12.96V5a1 1 0 0 0-1-1m2 13a2 2 0 0 1-3.99.196L10 17z"/></svg>
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