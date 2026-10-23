<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M12.477 4.546a1.01 1.01 0 0 1 1.097-1.409A9 9 0 0 1 12 21c-4.434 0-8.118-3.206-8.863-7.426a1.01 1.01 0 0 1 1.409-1.097 6 6 0 0 0 7.931-7.931m2.404 1.072a8 8 0 0 1-9.263 9.263 7.002 7.002 0 1 0 9.263-9.263M5.565 7.716l.064.14a3.26 3.26 0 0 0 1.237 1.363l.1.06a.068.068 0 0 1 0 .117l-.1.058a3.26 3.26 0 0 0-1.237 1.364l-.064.14a.07.07 0 0 1-.104.03.1.1 0 0 1-.026-.03l-.064-.14a3.26 3.26 0 0 0-1.237-1.364l-.1-.058a.068.068 0 0 1 0-.118l.1-.059A3.26 3.26 0 0 0 5.37 7.855l.064-.14a.071.071 0 0 1 .13 0zm2.832-4.859c.04-.09.166-.09.206 0l.102.222a5.2 5.2 0 0 0 1.97 2.172l.157.092a.108.108 0 0 1 0 .189l-.158.092a5.2 5.2 0 0 0-2.07 2.394.113.113 0 0 1-.207 0l-.102-.222a5.2 5.2 0 0 0-1.97-2.172l-.158-.092a.108.108 0 0 1 0-.189l.158-.092a5.2 5.2 0 0 0 1.97-2.172z" clip-rule="evenodd"/></svg>
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