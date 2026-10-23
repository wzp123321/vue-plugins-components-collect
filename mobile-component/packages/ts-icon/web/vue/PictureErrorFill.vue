<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M20 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4L7 5H4v10.1l4.113-4.114L9 12l-3.5 7.5 7.565-7.093 1.763 1.765 1.237-1.237a1.25 1.25 0 0 1 1.769 0L20 15.1V5h-6.5l1.667-2z"/><path fill="currentColor" d="M15.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"/><path fill="currentColor" d="m6.694 7.847 3.059 3.495a1 1 0 0 1 .153 1.08L8.6 15.225l3.617-3.392-2.064-3.302a1 1 0 0 1 .08-1.17L13.865 3h2.604l-4.237 5.083 2.117 3.387a1 1 0 0 1-.165 1.26l-8 7.5a1 1 0 0 1-1.59-1.153l3.223-6.91-3.07-3.509a1 1 0 0 1-.142-1.105L6.882 3h2.236z"/></svg>
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