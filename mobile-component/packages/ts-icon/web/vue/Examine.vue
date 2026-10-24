<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><g fill="currentColor"><path fill-rule="evenodd" d="M15 2a2 2 0 0 1 1.732 1H18a2 2 0 0 1 2 2v6h-2V5h-1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2H6v15h6v2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1.268A2 2 0 0 1 9 2zM9 5h6V4H9z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M18 13.501a1 1 0 0 1 .864.496l.91 1.562 1.766.382a1 1 0 0 1 .534 1.644l-1.204 1.347.182 1.8a1 1 0 0 1-1.398 1.015L18 21.017l-1.654.73a1 1 0 0 1-1.316-.507 1 1 0 0 1-.082-.509l.182-1.798-1.204-1.348a1 1 0 0 1 .534-1.644l1.766-.382.91-1.562a1 1 0 0 1 .864-.496m-.267 3.445a1 1 0 0 1-.652.474l-.52.112.353.397a1 1 0 0 1 .25.767l-.053.528.486-.214a1 1 0 0 1 .806 0l.486.214-.054-.528a1 1 0 0 1 .25-.767l.355-.397-.52-.112a1 1 0 0 1-.653-.474l-.267-.46z" clip-rule="evenodd"/><path d="M12 14a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zM15 10a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2z"/></g></svg>
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