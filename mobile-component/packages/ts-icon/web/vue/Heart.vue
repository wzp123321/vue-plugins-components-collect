<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 4.338c2.072-1.685 4.534-1.679 6.494-.537 2.095 1.22 3.569 3.7 3.504 6.592-.08 3.61-2.89 6.794-7.679 9.638-.71.422-1.458.97-2.319.97-.845-.001-1.625-.558-2.32-.97-4.787-2.844-7.597-6.03-7.678-9.638C1.937 7.5 3.412 5.023 5.506 3.8 7.466 2.66 9.928 2.653 12 4.338m5.487 1.192c-1.394-.812-3.136-.782-4.644.743a1.19 1.19 0 0 1-1.686 0C9.65 4.748 7.907 4.718 6.513 5.53c-1.444.842-2.56 2.628-2.511 4.82.056 2.51 2.04 5.195 6.7 7.963.408.242.834.553 1.298.682.464-.129.89-.44 1.298-.682 4.66-2.768 6.644-5.451 6.7-7.964.05-2.19-1.067-3.977-2.51-4.819" clip-rule="evenodd"/></svg>
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