<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M4.712 18.141c-1.537-1.69-1.957-3.828-1.77-5.738.206-2.107 1.167-4.128 2.418-5.171 1.672-1.393 3.428-1.965 4.952-2.245q1.114-.191 2.24-.283c.404-.038.813-.076 1.206-.174.828-.207 1.645-.543 2.318-1.077.308-.245.62-.493 1.035-.447a1 1 0 0 1 .735.46c3.2 5.067 2.717 10.446.044 13.834-1.335 1.691-3.21 2.871-5.397 3.22-1.908.303-3.993-.036-6.094-1.136a11 11 0 0 0-.41 1.758 1 1 0 1 1-1.98-.283c.124-.865.36-1.786.703-2.718m5.96-11.187c.704-.129 1.365-.191 2.007-.254.524-.05 1.052-.102 1.564-.23a8.9 8.9 0 0 0 2.45-1.006c2.178 4.117 1.57 8.134-.373 10.598-1.048 1.328-2.49 2.22-4.14 2.482-1.483.236-3.2-.024-5.03-1.026 1.112-2.267 2.93-4.44 5.297-5.623a1 1 0 1 0-.894-1.79c-2.608 1.304-4.606 3.559-5.905 5.964-.641-1.05-.833-2.271-.715-3.472.169-1.728.96-3.205 1.707-3.829 1.328-1.107 2.728-1.574 4.033-1.814z" clip-rule="evenodd"/></svg>
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