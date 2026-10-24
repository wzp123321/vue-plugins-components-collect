<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M10.539 2.598a2 2 0 0 1 2.922 0l1.685 1.804 2.468-.083a2 2 0 0 1 2.066 2.066l-.083 2.468 1.83 1.71a2 2 0 0 1 .048 2.875l-.268.269a1 1 0 1 1-1.414-1.414l.268-.269-1.83-1.71a2 2 0 0 1-.633-1.53l.083-2.466-2.467.083a2 2 0 0 1-1.529-.633L12 3.965l-1.686 1.803a2 2 0 0 1-1.53.633l-2.466-.083.083 2.467a2 2 0 0 1-.633 1.53L3.965 12l1.803 1.685c.422.394.652.953.633 1.53l-.083 2.466 2.467-.083a2 2 0 0 1 1.53.633l1.71 1.83.768-.768a1 1 0 0 1 1.414 1.414l-.769.768a2 2 0 0 1-2.875-.049l-1.71-1.829-2.468.083a2 2 0 0 1-2.066-2.066l.083-2.468-1.804-1.685a2 2 0 0 1 0-2.922l1.804-1.686-.083-2.468A2 2 0 0 1 6.385 4.32l2.468.083zM19.999 18a1 1 0 0 1 0 2h-3a1 1 0 0 1 0-2zm0-3a1 1 0 0 1 0 2h-3a1 1 0 0 1 0-2zm-8-7a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2A2 2 0 1 0 12.002 14 2 2 0 0 0 12 10"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-setting-list/setting_list.png'
<!-- #endif -->

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
.icon-image {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}
</style>