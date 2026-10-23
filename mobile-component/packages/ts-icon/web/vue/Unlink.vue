<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M7.998 17.998a1 1 0 0 1 .993.883l.007.116v2a1 1 0 0 1-1.993.117l-.007-.117v-2a1 1 0 0 1 1-1m8.243-8.123a1 1 0 0 1 1.32-.082l.094.083 2.121 2.122a5.5 5.5 0 0 1-7.596 7.952l-.182-.174-2.12-2.122a1 1 0 0 1 1.32-1.497l.093.082 2.121 2.122a3.5 3.5 0 0 0 5.091-4.8l-.14-.15-2.122-2.12a1 1 0 0 1 0-1.415M4.998 15.999a1 1 0 0 1 .117 1.993l-.117.006h-1a1 1 0 0 1-.117-1.992l.117-.007zm4.171-6.83a1 1 0 0 1 1.32-.082l.095.082 4.242 4.244a1 1 0 0 1-1.32 1.496l-.094-.082-4.243-4.242a1 1 0 0 1 0-1.415m-4.95-4.95a5.5 5.5 0 0 1 7.597-.173l.182.175 2.121 2.12a1 1 0 0 1-1.32 1.498l-.094-.083-2.12-2.121a3.5 3.5 0 0 0-5.092 4.8l.141.15 2.121 2.12a1 1 0 0 1-1.32 1.497l-.094-.083-2.12-2.12a5.5 5.5 0 0 1 0-7.778zM20 5.999a1 1 0 1 1 0 2h-1a1 1 0 0 1 0-2zm-4-4a1 1 0 0 1 .992.883l.007.117v2a1 1 0 0 1-1.993.116l-.007-.117v-2a1 1 0 0 1 1-1"/></svg>
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