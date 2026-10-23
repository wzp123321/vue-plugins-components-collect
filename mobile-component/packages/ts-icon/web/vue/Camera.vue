<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12 7.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m-3 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M9.207 3a1.5 1.5 0 0 0-1.06.44L6.585 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.586l-1.56-1.56A1.5 1.5 0 0 0 14.793 3zM7.854 6.56 9.414 5h5.172l1.56 1.56a1.5 1.5 0 0 0 1.061.44H20v12H4V7h2.793a1.5 1.5 0 0 0 1.06-.44" clip-rule="evenodd"/></svg>
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