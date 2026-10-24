<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><g fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6v-2H6V4h6v4.5a1.5 1.5 0 0 0 1.5 1.5H18v2h2V8.414A2 2 0 0 0 19.414 7L15 2.586A2 2 0 0 0 13.586 2zm11.586 6L14 4.414V8z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M18 13.501a1 1 0 0 1 .864.496l.91 1.562 1.766.382a1 1 0 0 1 .534 1.644l-1.204 1.347.182 1.8a1 1 0 0 1-1.398 1.015L18 21.017l-1.654.73a1 1 0 0 1-1.316-.507 1 1 0 0 1-.082-.509l.182-1.798-1.204-1.348a1 1 0 0 1 .534-1.644l1.766-.382.91-1.562a1 1 0 0 1 .864-.496m-.267 3.445a1 1 0 0 1-.652.474l-.52.112.353.397a1 1 0 0 1 .25.767l-.053.528.486-.214a1 1 0 0 1 .806 0l.486.214-.054-.528a1 1 0 0 1 .25-.767l.355-.397-.52-.112a1 1 0 0 1-.653-.474l-.267-.46z" clip-rule="evenodd"/><path d="M12 14a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2zm-2-4a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2z"/></g></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-document-examine/document_examine.png'
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