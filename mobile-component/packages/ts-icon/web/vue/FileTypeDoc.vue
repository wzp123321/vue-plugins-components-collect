<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g filter="url(#filter0_ii_16434_6581)"><path fill="url(#paint0_linear_16434_6581)" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/><path fill="url(#paint1_linear_16434_6581)" fill-opacity=".4" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/><path fill="url(#paint2_linear_16434_6581)" fill-opacity=".96" d="M4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z"/></g><path fill="#000037" fill-opacity=".129" fill-rule="evenodd" d="M18.3 22.56H7.5a2.16 2.16 0 0 1-2.16-2.16V3.6A2.16 2.16 0 0 1 7.5 1.44h7.366q.317 0 .614.09v1.776a2.82 2.82 0 0 0 1.83 2.64l3.103 1.164q.046.22.046.448V20.4a2.16 2.16 0 0 1-2.16 2.16m1.49-16.58-3.293-3.796a2 2 0 0 0-.177-.181v1.303a1.98 1.98 0 0 0 1.285 1.854zM4.5 3.6a3 3 0 0 1 3-3h7.366a3 3 0 0 1 2.266 1.034l3.433 3.958a3 3 0 0 1 .734 1.966V20.4a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3z" clip-rule="evenodd"/><g filter="url(#filter1_dii_16434_6581)"><path fill="#596FFE" d="M2.7 9a3 3 0 0 1 3-3h8.4a3 3 0 0 1 3 3v8.4a3 3 0 0 1-3 3H5.7a3 3 0 0 1-3-3z"/></g><path fill="#000037" fill-opacity=".129" fill-rule="evenodd" d="M14.1 6.72H5.7A2.28 2.28 0 0 0 3.42 9v8.4a2.28 2.28 0 0 0 2.28 2.28h8.4a2.28 2.28 0 0 0 2.28-2.28V9a2.28 2.28 0 0 0-2.28-2.28M5.7 6a3 3 0 0 0-3 3v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3z" clip-rule="evenodd"/><path fill="white" fill-rule="evenodd" d="M14.265 8.996a.72.72 0 0 1 .535.866l-1.638 6.943c-.18.764-1.238.841-1.528.111L9.9 12.546l-1.735 4.37c-.29.73-1.349.654-1.53-.111L4.999 9.862a.72.72 0 0 1 1.402-.33l1.173 4.972 1.657-4.173.005-.013q.016-.031.034-.062.013-.028.028-.054l.008-.011q.017-.022.035-.043.024-.033.053-.063l.022-.019a1 1 0 0 1 .077-.063l.012-.008q.016-.01.034-.018a1 1 0 0 1 .09-.046l.006-.003q.018-.007.037-.012a1 1 0 0 1 .089-.024q.033-.007.066-.01l.073-.004q.036 0 .072.005.034.002.067.009a1 1 0 0 1 .084.023q.022.006.043.013.004.001.007.004.043.018.083.043.023.011.044.024.032.024.062.05.024.019.046.039.021.022.04.047.027.03.05.061.016.03.031.06.019.03.034.062l.007.013 1.657 4.173 1.172-4.973a.72.72 0 0 1 .867-.535" clip-rule="evenodd"/><defs><linearGradient id="paint0_linear_16434_6581" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity=".9"/><stop offset="1" stop-color="white" stop-opacity=".9"/></linearGradient><linearGradient id="paint1_linear_16434_6581" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="#02062B" stop-opacity=".4"/><stop offset="1" stop-color="#02062B"/></linearGradient><linearGradient id="paint2_linear_16434_6581" x1="12.677" x2="12.677" y1=".6" y2="23.4" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#F8F8F8" stop-opacity=".9"/></linearGradient><filter id="filter0_ii_16434_6581" x="4.5" y=".12" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-.48"/><feGaussianBlur stdDeviation=".24"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.04 0"/><feBlend in2="shape" result="effect1_innerShadow_16434_6581"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-.72"/><feGaussianBlur stdDeviation=".06"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.02 0"/><feBlend in2="effect1_innerShadow_16434_6581" result="effect2_innerShadow_16434_6581"/></filter><filter id="filter1_dii_16434_6581" width="18" height="18" x="2.1" y="4.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="1.2" dy=".6"/><feGaussianBlur stdDeviation=".9"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0.239216 0 0 0 0 0.635294 0 0 0 0 1 0 0 0 0.1 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_16434_6581"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_16434_6581" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="-.6" dy="-.6"/><feGaussianBlur stdDeviation="1.2"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0.25 0"/><feBlend in2="shape" result="effect2_innerShadow_16434_6581"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx=".6" dy="1.2"/><feGaussianBlur stdDeviation="1.8"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"/><feBlend in2="effect2_innerShadow_16434_6581" result="effect3_innerShadow_16434_6581"/></filter></defs></svg>
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