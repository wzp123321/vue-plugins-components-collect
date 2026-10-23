<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M14.999 3a1 1 0 1 0 0 2 4 4 0 0 1 4 4 1 1 0 1 0 2 0 6 6 0 0 0-6-6"/><path fill="currentColor" d="M15.106 6.053a1 1 0 1 0-.347 1.97 1.5 1.5 0 0 1 1.225 1.268 1 1 0 0 0 1.98-.278 3.5 3.5 0 0 0-2.858-2.96"/><path fill="currentColor" fill-rule="evenodd" d="M16.55 22.133c-1.44-.053-5.52-.617-9.794-4.89-4.273-4.274-4.837-8.354-4.89-9.795-.08-2.196 1.601-4.329 3.545-5.162a1.47 1.47 0 0 1 1.445.159c1.607 1.173 2.717 2.95 3.67 4.342a1.504 1.504 0 0 1-.177 1.913l-1.357 1.357c.315.695.957 1.894 2.006 2.943 1.05 1.05 2.249 1.691 2.944 2.006l1.356-1.356a1.5 1.5 0 0 1 1.918-.171c1.42.984 3.087 2.077 4.304 3.634a1.47 1.47 0 0 1 .188 1.485c-.837 1.953-2.954 3.616-5.157 3.535" clip-rule="evenodd"/></svg>
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