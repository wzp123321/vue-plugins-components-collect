<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M12 3c2.314 0 4.456.408 6.058 1.109.799.35 1.509.792 2.032 1.334.485.5.845 1.128.902 1.856L21 7.5v10c0 .814-.381 1.51-.91 2.057-.523.542-1.233.984-2.032 1.334C16.456 21.591 14.314 22 12 22s-4.456-.408-6.058-1.109c-.799-.35-1.509-.792-2.032-1.334-.485-.5-.845-1.128-.902-1.856L3 17.5v-10c0-.814.381-1.51.91-2.057.523-.542 1.233-.984 2.032-1.334C7.544 3.409 9.686 3 12 3m7 12.407a8 8 0 0 1-.942.484C16.456 16.591 14.314 17 12 17s-4.456-.408-6.058-1.109A8 8 0 0 1 5 15.407V17.5c0 .152.066.376.348.667.286.296.748.608 1.396.892C8.038 19.625 9.895 20 12 20s3.962-.375 5.256-.941c.648-.284 1.11-.596 1.396-.892.282-.29.348-.515.348-.667zm0-5a8 8 0 0 1-.942.484C16.456 11.591 14.314 12 12 12s-4.456-.408-6.058-1.109A8 8 0 0 1 5 10.407V12.5c0 .152.066.376.348.667.286.296.748.608 1.396.892C8.038 14.625 9.895 15 12 15s3.962-.375 5.256-.941c.648-.284 1.11-.596 1.396-.892.282-.29.348-.515.348-.667zM12 5c-2.105 0-3.962.375-5.256.941-.648.284-1.11.596-1.396.892-.282.29-.348.515-.348.667s.066.376.348.667c.286.296.748.608 1.396.892C8.038 9.625 9.895 10 12 10s3.962-.375 5.256-.941c.648-.284 1.11-.596 1.396-.892.282-.29.348-.515.348-.667s-.066-.376-.348-.667c-.286-.296-.748-.608-1.396-.892C15.962 5.375 14.105 5 12 5"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-coin/coin.png'
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