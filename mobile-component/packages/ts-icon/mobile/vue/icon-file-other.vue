<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g filter="url(#filter0_ii_16434_6643)"><path fill="url(#paint0_linear_16434_6643)" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/><path fill="url(#paint1_linear_16434_6643)" fill-opacity=".4" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/><path fill="url(#paint2_linear_16434_6643)" fill-opacity=".96" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/></g><path fill="#000037" fill-opacity=".129" fill-rule="evenodd" d="M18.3 22.56H7.5a2.16 2.16 0 0 1-2.16-2.16V3.6A2.16 2.16 0 0 1 7.5 1.44h7.366q.317 0 .614.09v1.776a2.82 2.82 0 0 0 1.83 2.64l3.103 1.164q.046.22.046.448V20.4a2.16 2.16 0 0 1-2.16 2.16m1.49-16.58-3.293-3.796a2 2 0 0 0-.177-.181v1.303a1.98 1.98 0 0 0 1.285 1.854zM4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z" clip-rule="evenodd"/><g filter="url(#filter1_dii_16434_6643)"><path fill="#B8BAC5" d="M2.7 9a3 3 0 0 1 3-3h8.4a3 3 0 0 1 3 3v8.4a3 3 0 0 1-3 3H5.7a3 3 0 0 1-3-3z"/></g><path fill="#000037" fill-opacity=".129" fill-rule="evenodd" d="M14.1 6.72H5.7A2.28 2.28 0 0 0 3.42 9v8.4a2.28 2.28 0 0 0 2.28 2.28h8.4a2.28 2.28 0 0 0 2.28-2.28V9a2.28 2.28 0 0 0-2.28-2.28M5.7 6a3 3 0 0 0-3 3v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3z" clip-rule="evenodd"/><path fill="white" d="M10.2 16.44c.43 0 .78.35.78.78v.06a.78.78 0 0 1-1.56 0v-.06c0-.43.349-.78.78-.78m-.3-8.1c1.712 0 3.18 1.32 3.18 3.043 0 1.042-.646 1.836-1.198 2.257-.576.44-.902.911-.902 1.289a.78.78 0 1 1-1.56 0c0-1.16.873-2.039 1.516-2.53.33-.252.584-.636.584-1.016 0-.777-.682-1.483-1.62-1.483s-1.62.707-1.62 1.483a.78.78 0 1 1-1.56 0C6.72 9.66 8.187 8.34 9.9 8.34"/><defs><linearGradient id="paint0_linear_16434_6643" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity=".9"/><stop offset="1" stop-color="white" stop-opacity=".9"/></linearGradient><linearGradient id="paint1_linear_16434_6643" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="#02062B" stop-opacity=".4"/><stop offset="1" stop-color="#02062B"/></linearGradient><linearGradient id="paint2_linear_16434_6643" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#F8F8F8" stop-opacity=".9"/></linearGradient><filter id="filter0_ii_16434_6643" x="4.5" y=".12" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-.48"/><feGaussianBlur stdDeviation=".24"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.04 0"/><feBlend in2="shape" result="effect1_innerShadow_16434_6643"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-.72"/><feGaussianBlur stdDeviation=".06"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.02 0"/><feBlend in2="effect1_innerShadow_16434_6643" result="effect2_innerShadow_16434_6643"/></filter><filter id="filter1_dii_16434_6643" width="18" height="18" x="2.1" y="4.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="1.2" dy=".6"/><feGaussianBlur stdDeviation=".9"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0.721569 0 0 0 0 0.729412 0 0 0 0 0.772549 0 0 0 0.1 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_16434_6643"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_16434_6643" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="-.6" dy="-.6"/><feGaussianBlur stdDeviation="1.2"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0.25 0"/><feBlend in2="shape" result="effect2_innerShadow_16434_6643"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx=".6" dy="1.2"/><feGaussianBlur stdDeviation="1.8"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"/><feBlend in2="effect2_innerShadow_16434_6643" result="effect3_innerShadow_16434_6643"/></filter></defs></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-file-other/file_other.png'
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