<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M9 9.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/><path d="M4.5 9.5a7.5 7.5 0 1 1 15 0c0 2.568-1.399 4.656-2.85 6.14-1.46 1.492-3.087 2.492-3.804 2.896a1.71 1.71 0 0 1-1.691 0c-.717-.404-2.344-1.404-3.805-2.897C5.9 14.156 4.5 12.068 4.5 9.5M12 4a5.5 5.5 0 0 0-5.5 5.5c0 1.817.996 3.428 2.28 4.74 1.189 1.216 2.528 2.074 3.22 2.476.693-.402 2.032-1.26 3.22-2.475 1.285-1.313 2.28-2.924 2.28-4.741A5.5 5.5 0 0 0 12 4"/><path d="M7.28 18.56a1 1 0 1 0-.56-1.92c-.667.195-1.28.445-1.749.766-.436.299-.97.82-.97 1.594 0 .783.547 1.308.99 1.607.477.322 1.102.573 1.785.768 1.379.394 3.226.625 5.225.625s3.845-.23 5.224-.625c.683-.195 1.308-.446 1.785-.768.443-.3.99-.824.99-1.607 0-.774-.534-1.295-.97-1.594-.469-.321-1.082-.571-1.75-.766a1 1 0 0 0-.56 1.92c.501.146.861.3 1.092.44-.239.143-.614.303-1.137.452-1.154.33-2.807.548-4.675.548s-3.52-.218-4.675-.548c-.522-.149-.897-.309-1.136-.452.23-.14.59-.294 1.091-.44"/></g></svg>
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