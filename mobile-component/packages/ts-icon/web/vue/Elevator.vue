<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M7.958 9.321c.373 0 .68.28.726.639l.006.092v2.126l.214-.211a.735.735 0 0 1 1.25.44.73.73 0 0 1-.148.518l-.066.074-1.424 1.419q-.011.014-.022.027a.74.74 0 0 1-1.006.065.7.7 0 0 1-.105-.11l-1.41-1.403a.727.727 0 0 1 .445-1.238.74.74 0 0 1 .517.143l.076.065.214.213v-2.128c0-.403.328-.73.733-.73M16.043 9.325a.7.7 0 0 1 .257.062 1 1 0 0 1 .106.06q.02.01.04.023l.074.066 1.465 1.458a.729.729 0 0 1-.443 1.244.74.74 0 0 1-.518-.147l-.074-.064-.216-.214v2.13a.735.735 0 0 1-1.202.567.73.73 0 0 1-.257-.476l-.005-.092v-2.13l-.214.215a.736.736 0 0 1-.962.064l-.075-.064a.73.73 0 0 1-.066-.959l.066-.074 1.464-1.458a1 1 0 0 1 .105-.087q.02-.013.04-.024a1 1 0 0 1 .083-.043l.028-.01a1 1 0 0 1 .1-.032q.025-.005.05-.008l.063-.009h.027l.024-.002q.02.001.04.004"/><path fill="currentColor" fill-rule="evenodd" d="M20 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM5 20h6V4H5zm8 0h6V4h-6z" clip-rule="evenodd"/></svg>
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