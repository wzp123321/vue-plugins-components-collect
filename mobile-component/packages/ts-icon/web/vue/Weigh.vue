<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M18 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm0 2H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m-6 1c2.08 0 3.716.448 4.628.77.891.317 1.325 1.192 1.227 2.02l-.024.155-.722 3.61c-.196.977-1.232 1.45-2.079 1.112-.645-.258-1.7-.604-2.75-.66l-.3-.007c-1.133.005-2.312.388-3.01.667-.805.321-1.78-.09-2.043-.97l-.036-.143-.722-3.609c-.174-.872.256-1.839 1.203-2.174A14 14 0 0 1 12 6m0 2c-1.719 0-3.08.355-3.856.62l.6 2.997c.683-.24 1.623-.506 2.624-.59l.738-1.474a1 1 0 1 1 1.788.894l-.352.705c.65.122 1.244.3 1.715.465l.6-2.997A12.1 12.1 0 0 0 12 8" clip-rule="evenodd"/></svg>
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