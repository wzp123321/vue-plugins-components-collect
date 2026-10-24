<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="m15.541 14.179.924.336a7 7 0 0 1-.102.84c-.103.55-.374.784-.85.784h-.961c-.607 0-.859-.355-.859-1.092V8l1.008.047v2.296c.187-.374.402-.812.635-1.326l.803.411c-.122.317-.28.672-.476 1.055-.187.382-.364.718-.523.989l-.439-.261v.681l.262-.28q.49.437 1.288 1.307l-.654.802-.476-.541a15 15 0 0 0-.42-.485v1.997c0 .299.019.392.206.401h.326c.159-.009.224-.102.252-.336.028-.196.047-.382.056-.578m-3.145-3.836V8.028l.97.047v3.854c-.027 2.436-.354 3.155-1.773 4.443l-.793-.85.205-.167c-.326.046-.802.13-1.446.233-.644.112-1.12.196-1.447.261L8 14.795l.336-.047v-2.987l.933.047v2.781l.355-.056V11.38H8.448V8.224h2.744v1.148l.672-.29q.154.296.532 1.26m-2.156-.019V9.26h-.821v1.064zm.952-.765v1.82h-.57v.7h.533v.55a32 32 0 0 0 1.241-.877v-.532l-.485.233c-.112-.345-.355-.97-.719-1.894m.01 5.236.018.382c.364-.317.625-.634.793-.961.178-.327.29-.737.336-1.213q-.588.433-.756.588l-.438-.887v.439h-.532v1.213l.569-.103z"/><path fill="currentColor" d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.186-3.948-9.45-9.001-9.95-.55-.055-1 .398-1 .95 0 .553.45.994.999 1.062A8.001 8.001 0 0 1 12 20 8 8 0 0 1 7.5 5.385V7a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1h-4a1 1 0 1 0 0 2H6a9.99 9.99 0 0 0-4 8"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-skip/skip.png'
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