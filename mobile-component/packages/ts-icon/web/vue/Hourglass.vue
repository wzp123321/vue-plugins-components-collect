<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1c0 1.441-.609 2.984-1.4 4.316A14.3 14.3 0 0 1 15.533 12a14.3 14.3 0 0 1 2.065 2.684C18.391 16.016 19 17.56 19 19v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1c0-1.441.609-2.984 1.4-4.316A14.3 14.3 0 0 1 8.467 12c-.756-.767-1.48-1.7-2.065-2.684C5.609 7.984 5 6.44 5 5zm12 0H7v1c0 .929.414 2.107 1.12 3.294.696 1.17 1.609 2.236 2.458 2.933a1 1 0 0 1 0 1.546c-.85.697-1.762 1.763-2.458 2.933C7.414 16.893 7 18.071 7 19v1h10v-1c0-.929-.414-2.107-1.12-3.294-.696-1.17-1.609-2.236-2.458-2.933a1 1 0 0 1 0-1.546c.85-.697 1.762-1.763 2.458-2.933C16.586 7.107 17 5.929 17 5z" clip-rule="evenodd"/></svg>
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