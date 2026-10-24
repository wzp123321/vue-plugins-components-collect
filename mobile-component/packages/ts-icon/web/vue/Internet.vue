<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m1.683 13.95a29 29 0 0 1-3.366 0c.136.786.309 1.494.51 2.098.252.756.53 1.296.79 1.626.088.11.223.326.385.326.145-.013.302-.227.38-.326.26-.33.539-.87.79-1.626.222-.685.394-1.387.511-2.098m5.83-1.195q-.399.171-.833.315c-.852.284-1.848.512-2.94.67a17 17 0 0 1-.67 2.94q-.144.435-.315.833a8.02 8.02 0 0 0 4.758-4.758m-15.026 0a8.02 8.02 0 0 0 4.758 4.758 11 11 0 0 1-.315-.833 17 17 0 0 1-.67-2.94 17 17 0 0 1-2.94-.67q-.435-.144-.833-.315m5.585-4.683a25.5 25.5 0 0 0 0 3.856c1.282.097 2.574.097 3.856 0a25.5 25.5 0 0 0 0-3.856 25.5 25.5 0 0 0-3.856 0m5.878.245a29 29 0 0 1 0 3.366 14.4 14.4 0 0 0 2.098-.51c.756-.252 1.296-.53 1.626-.79.11-.087.326-.224.326-.385-.013-.145-.227-.302-.326-.38-.33-.26-.87-.539-1.626-.79a14.4 14.4 0 0 0-2.098-.511m-7.9 0c-.786.136-1.493.309-2.098.51-.756.252-1.295.53-1.626.79-.24.19-.312.333-.323.368-.045.15.23.323.323.397.33.26.87.539 1.626.79.605.202 1.312.375 2.098.51a28 28 0 0 1 0-3.365m1.195-5.83a8.02 8.02 0 0 0-4.758 4.758q.399-.171.833-.315a17 17 0 0 1 2.94-.67c.158-1.092.386-2.088.67-2.94q.144-.435.315-.833m5.51 0q.171.399.315.833c.284.852.512 1.848.67 2.94 1.092.158 2.088.386 2.94.67q.435.144.833.315a8.02 8.02 0 0 0-4.758-4.758M12 4c-.139 0-.312.237-.382.326-.26.33-.539.87-.79 1.626a14.4 14.4 0 0 0-.51 2.098 28 28 0 0 1 3.364 0 14.4 14.4 0 0 0-.51-2.098c-.251-.756-.53-1.295-.79-1.626C12.312 4.236 12.14 4 12 4"/></svg>
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