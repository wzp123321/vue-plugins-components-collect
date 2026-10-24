<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M21.33 6.502c.372 0 .67-.298.67-.659V2.672A.67.67 0 0 0 21.33 2h-3.16a.67.67 0 0 0-.67.672v.721H6.501v-.721A.67.67 0 0 0 5.83 2H2.67a.67.67 0 0 0-.67.672V5.83c0 .373.298.671.67.671h.768v10.983H2.67a.667.667 0 0 0-.67.672v3.171c0 .373.298.672.67.672h3.16c.36 0 .658-.299.67-.672v-.796h10.998v.796c0 .373.298.672.67.672h3.161c.372 0 .67-.299.67-.672v-3.171a.67.67 0 0 0-.67-.672h-.805V6.502zm-2.492-3.171h1.823v1.828h-1.823zm-15.499 0h1.823v1.828H3.339zm1.823 17.326H3.339v-1.829h1.823zm9.225-5.423a.596.596 0 1 1-1.19 0V11.19c0-.273 0-.733-.248-.982-.174-.174-.472-.261-.88-.261h-.41v5.298a.596.596 0 1 1-1.19 0V9.948H8.77v5.298a.596.596 0 1 1-1.19 0V9.351c0-.324.26-.597.595-.597h3.893c.744 0 1.315.211 1.724.61.595.609.595 1.442.595 1.84zm2.616-6.132c.26.012.459.224.459.473s-.21.46-.459.46h-1.711a.44.44 0 0 1-.335-.15.42.42 0 0 1-.124-.335c0-.112.075-1.157.856-1.505.372-.162.78-.373.868-.647a.43.43 0 0 0-.062-.336.47.47 0 0 0-.26-.211c-.249-.05-.484.087-.62.373a.455.455 0 0 1-.62.211.46.46 0 0 1-.211-.622c.322-.659.98-1.02 1.649-.87.36.074.67.31.868.647.198.335.248.733.136 1.082-.223.696-.942 1.02-1.376 1.219a.5.5 0 0 0-.186.211zm3.658 11.555h-1.823v-1.829h1.823z"/></svg>
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