<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12.406 6.414C15.491 5.043 18.61 5.463 20 5.77v10.96c-1.741-.33-5.06-.631-8.406.856-3.085 1.37-6.203.95-7.594.643V7.27c1.741.33 5.06.631 8.406-.856M20.53 3.84c-1.517-.348-5.21-.91-8.936.746-3.167 1.408-6.37.927-7.7.619C2.975 4.992 2 5.667 2 6.694v11.585c0 .85.552 1.67 1.47 1.88 1.517.348 5.21.911 8.936-.745 3.167-1.408 6.37-.927 7.7-.619.918.212 1.894-.462 1.894-1.489V5.721c0-.85-.552-1.67-1.47-1.88M10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0m2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clip-rule="evenodd"/></svg>
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