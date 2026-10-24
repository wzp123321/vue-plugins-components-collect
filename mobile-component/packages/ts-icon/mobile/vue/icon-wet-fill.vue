<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" fill-rule="evenodd" d="M16.696 2.378a1.183 1.183 0 0 1 1.608 0c.28.258.93.892 1.517 1.724C20.39 4.91 21 6.042 21 7.278 21 9.252 19.512 11 17.5 11S14 9.252 14 7.278c0-1.235.61-2.368 1.18-3.176.446-.625.954-1.202 1.516-1.724M4.708 5.363a1.18 1.18 0 0 1 1.584 0c.206.186.608.573.966 1.073C7.6 6.913 8 7.627 8 8.444 8 9.82 6.915 11 5.5 11S3 9.82 3 8.444c0-.817.4-1.531.742-2.008.358-.5.76-.887.966-1.073m5.503 3.998a1.184 1.184 0 0 1 1.578 0c.364.324 1.39 1.278 2.332 2.56.923 1.254 1.879 2.973 1.879 4.8C16 19.572 13.824 22 11 22s-5-2.427-5-5.278c0-1.828.956-3.547 1.879-4.801a17.4 17.4 0 0 1 2.332-2.56" clip-rule="evenodd"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-wet-fill/wet_fill.png'
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