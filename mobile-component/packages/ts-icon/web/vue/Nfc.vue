<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M16.66 12.826c.333 0 .69.05.985.128.222.06.355.272.355.502 0 .207-.207.35-.407.297a3.2 3.2 0 0 0-.81-.11c-.901 0-1.51.524-1.51 1.593q0 .43.207.752c.278.44.752.687 1.27.719l.143.007c.212 0 .428-.036.63-.098.219-.068.477.082.477.31s-.129.44-.347.499c-.278.076-.587.104-.962.104-1.535 0-2.539-.9-2.539-2.293 0-.498.104-.933.318-1.296.42-.718 1.211-1.114 2.19-1.114M8.786 16.493h.084v-3.057a.525.525 0 1 1 1.05 0v3.51a.5.5 0 0 1-.5.5h-.874a.5.5 0 0 1-.478-.353l-.98-3.172H7.05v3a.525.525 0 1 1-1.05 0v-3.032a.978.978 0 0 1 1.914-.283zM13.7 13.348a.437.437 0 0 1-.437.437h-1.5v.985h1.263a.408.408 0 0 1 0 .816h-1.262v1.325a.535.535 0 0 1-1.07 0v-3a1 1 0 0 1 1-1h1.57c.24 0 .436.196.436.437M12 9c1.008 0 1.93.374 2.634.99a1 1 0 0 1 .347.688 1 1 0 0 1-.245.73 1 1 0 0 1-1.419.087A2 2 0 0 0 12 11a2 2 0 0 0-1.317.495.999.999 0 1 1-1.317-1.505A4 4 0 0 1 12 9"/><path fill="currentColor" d="M12 6c1.765 0 3.38.654 4.61 1.732a1 1 0 0 1-1.318 1.505C14.382 8.438 13.212 7.998 12 8a4.98 4.98 0 0 0-3.292 1.237A1 1 0 0 1 7.39 7.732 6.98 6.98 0 0 1 12 6"/><path fill="currentColor" fill-rule="evenodd" d="M19 3a2 2 0 0 1 1.995 1.85L21 5v14a2 2 0 0 1-1.85 1.995L19 21H5a2 2 0 0 1-1.995-1.85L3 19V5a2 2 0 0 1 1.85-1.995L5 3zM5 19h14V5H5z" clip-rule="evenodd"/></svg>
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