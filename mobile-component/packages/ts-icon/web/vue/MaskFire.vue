<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 2a8.2 8.2 0 0 1 7.552 5H22a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.8v1.8a8.2 8.2 0 0 1-16.4 0V12H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.448A8.2 8.2 0 0 1 12 2m0 2a6.2 6.2 0 0 0-6.2 6.2v3.6a6.2 6.2 0 0 0 12.4 0v-3.6A6.2 6.2 0 0 0 12 4m-.207 7.793a1 1 0 1 1 1.414 1.414l-.793.793 1.293 1.293a1 1 0 0 1 0 1.414l-1.5 1.5a1 1 0 1 1-1.414-1.414l.793-.793-1.293-1.293a1 1 0 0 1 0-1.414zM14.5 6A1.5 1.5 0 0 1 16 7.5v2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 9.5v-2A1.5 1.5 0 0 1 9.5 6zM3 10h.805q.012-.508.084-1H3zm17.111-1q.072.492.084 1H21V9zM10 9h4V8h-4z"/></svg>
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