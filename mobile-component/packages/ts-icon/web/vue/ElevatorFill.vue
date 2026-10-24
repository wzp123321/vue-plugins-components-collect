<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M11 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h7zM7.958 9.321a.73.73 0 0 0-.733.73v2.129l-.214-.213-.076-.065a.735.735 0 0 0-.993.103.73.73 0 0 0 .032.992L7.383 14.4q.046.06.105.11a.736.736 0 0 0 1.006-.065q.011-.013.022-.027l1.424-1.419.066-.074a.73.73 0 0 0 .148-.518.734.734 0 0 0-1.25-.44l-.214.21v-2.125l-.006-.092a.73.73 0 0 0-.726-.639M20 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-7V2zm-4.021 7.323h-.026l-.064.009q-.025.003-.05.008a1 1 0 0 0-.1.031l-.028.01a1 1 0 0 0-.081.044q-.022.011-.042.024a1 1 0 0 0-.105.087l-1.464 1.458-.066.074a.73.73 0 0 0 .066.96l.075.063a.74.74 0 0 0 .962-.064l.214-.214v2.13l.005.091a.73.73 0 0 0 1.263.411.73.73 0 0 0 .196-.503v-2.13l.216.215.074.064a.74.74 0 0 0 .518.147.74.74 0 0 0 .48-.248.727.727 0 0 0-.037-.996L16.52 9.536l-.074-.066c-.012-.01-.027-.015-.04-.024a.7.7 0 0 0-.363-.12q-.02-.004-.04-.005z" clip-rule="evenodd"/></svg>
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