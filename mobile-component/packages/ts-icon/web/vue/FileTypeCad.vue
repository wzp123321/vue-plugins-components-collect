<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_ii_16499_661)">
<path d="M4.5 3.60005C4.49996 1.94316 5.84312 0.599976 7.5 0.599976H14.8657C15.7352 0.599976 16.5619 0.97721 17.1317 1.63397L20.5654 5.5916C21.0388 6.13718 21.2994 6.83522 21.2994 7.55752L21.2998 20.3999C21.2999 22.0568 19.9567 23.4 18.2998 23.4H7.5004C5.84358 23.4 4.50044 22.0569 4.5004 20.4L4.5 3.60005Z" fill="url(#paint0_linear_16499_661)"/>
<path d="M4.5 3.60005C4.49996 1.94316 5.84312 0.599976 7.5 0.599976H14.8657C15.7352 0.599976 16.5619 0.97721 17.1317 1.63397L20.5654 5.5916C21.0388 6.13718 21.2994 6.83522 21.2994 7.55752L21.2998 20.3999C21.2999 22.0568 19.9567 23.4 18.2998 23.4H7.5004C5.84358 23.4 4.50044 22.0569 4.5004 20.4L4.5 3.60005Z" fill="url(#paint1_linear_16499_661)" fill-opacity="0.4"/>
<path d="M4.5 3.60005C4.49996 1.94316 5.84312 0.599976 7.5 0.599976H14.8657C15.7352 0.599976 16.5619 0.97721 17.1317 1.63397L20.5654 5.5916C21.0388 6.13718 21.2994 6.83522 21.2994 7.55752L21.2998 20.3999C21.2999 22.0568 19.9567 23.4 18.2998 23.4H7.5004C5.84358 23.4 4.50044 22.0569 4.5004 20.4L4.5 3.60005Z" fill="url(#paint2_linear_16499_661)" fill-opacity="0.96"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.2998 22.56H7.5004C6.30749 22.56 5.34043 21.5929 5.3404 20.4L5.34 3.60003C5.33997 2.40707 6.30704 1.43998 7.5 1.43998H14.8657C15.0759 1.43998 15.2826 1.47058 15.4799 1.52913V3.30611C15.4799 4.48161 16.2091 5.53381 17.3098 5.94656L20.4126 7.11011C20.4435 7.25625 20.4594 7.40616 20.4594 7.55754L20.4598 20.3999C20.4599 21.5929 19.4928 22.56 18.2998 22.56ZM19.7899 5.97948L16.4973 2.18445C16.4414 2.12011 16.3822 2.0595 16.3199 2.0028V3.30611C16.3199 4.13146 16.8319 4.87024 17.6047 5.16004L19.7899 5.97948ZM4.5 3.60005C4.49996 1.94316 5.84312 0.599976 7.5 0.599976H14.8657C15.7352 0.599976 16.5619 0.97721 17.1317 1.63397L20.5654 5.5916C21.0388 6.13718 21.2994 6.83522 21.2994 7.55752L21.2998 20.3999C21.2999 22.0568 19.9567 23.4 18.2998 23.4H7.5004C5.84358 23.4 4.50044 22.0569 4.5004 20.4L4.5 3.60005Z" fill="#000037" fill-opacity="0.129412"/>
<g filter="url(#filter1_dii_16499_661)">
<path d="M2.69971 9C2.69971 7.34315 4.04285 6 5.69971 6H14.0997C15.7566 6 17.0997 7.34315 17.0997 9V17.4C17.0997 19.0569 15.7566 20.4 14.0997 20.4H5.69971C4.04285 20.4 2.69971 19.0569 2.69971 17.4V9Z" fill="#FF4050"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.0997 6.72H5.69971C4.4405 6.72 3.41971 7.74079 3.41971 9V17.4C3.41971 18.6592 4.4405 19.68 5.69971 19.68H14.0997C15.3589 19.68 16.3797 18.6592 16.3797 17.4V9C16.3797 7.74079 15.3589 6.72 14.0997 6.72ZM5.69971 6C4.04285 6 2.69971 7.34315 2.69971 9V17.4C2.69971 19.0569 4.04285 20.4 5.69971 20.4H14.0997C15.7566 20.4 17.0997 19.0569 17.0997 17.4V9C17.0997 7.34315 15.7566 6 14.0997 6H5.69971Z" fill="#000037" fill-opacity="0.129412"/>
<mask id="mask0_16499_661" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="6" width="16" height="15">
<path d="M2.69971 9C2.69971 7.34315 4.04285 6 5.69971 6H14.0997C15.7566 6 17.0997 7.34315 17.0997 9V17.4C17.0997 19.0569 15.7566 20.4 14.0997 20.4H5.69971C4.04285 20.4 2.69971 19.0569 2.69971 17.4V9Z" fill="#FF4050"/>
</mask>
<g mask="url(#mask0_16499_661)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0005 11.5H14.5005C15.0525 11.5003 15.5005 11.9479 15.5005 12.5V14H18.0005V15H15.5005V16.5C15.5005 17.0521 15.0525 17.4997 14.5005 17.5H13.0005V22H12.0005V17.5H10.5005C9.9482 17.5 9.50049 17.0523 9.50049 16.5V15H2.00049V14H9.50049V12.5C9.50049 11.9477 9.9482 11.5 10.5005 11.5H12.0005L11.9995 6H12.9995L13.0005 11.5ZM13.0005 15V16.5H14.5005V15H13.0005ZM10.5005 16.5H12.0005V15H10.5005V16.5ZM13.0005 14H14.5005V12.5H13.0005V14ZM10.5005 14H12.0005V12.5H10.5005V14Z" fill="white"/>
</g>
<defs>
<filter id="filter0_ii_16499_661" x="4.5" y="0.119976" width="16.7998" height="23.28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-0.48"/>
<feGaussianBlur stdDeviation="0.24"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.04 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_16499_661"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-0.72"/>
<feGaussianBlur stdDeviation="0.06"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.00784314 0 0 0 0 0.0235294 0 0 0 0 0.168627 0 0 0 0.02 0"/>
<feBlend mode="normal" in2="effect1_innerShadow_16499_661" result="effect2_innerShadow_16499_661"/>
</filter>
<filter id="filter1_dii_16499_661" x="2.09971" y="4.8" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="1.2" dy="0.6"/>
<feGaussianBlur stdDeviation="0.9"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.25098 0 0 0 0 0.313726 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_16499_661"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_16499_661" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="-0.6" dy="-0.6"/>
<feGaussianBlur stdDeviation="1.2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0 0.336198 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect2_innerShadow_16499_661"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="0.6" dy="1.2"/>
<feGaussianBlur stdDeviation="1.8"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0"/>
<feBlend mode="normal" in2="effect2_innerShadow_16499_661" result="effect3_innerShadow_16499_661"/>
</filter>
<linearGradient id="paint0_linear_16499_661" x1="12.677" y1="0.599976" x2="12.677" y2="23.4" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0.9"/>
<stop offset="1.0001" stop-color="white" stop-opacity="0.9"/>
</linearGradient>
<linearGradient id="paint1_linear_16499_661" x1="12.677" y1="0.599976" x2="12.677" y2="23.4" gradientUnits="userSpaceOnUse">
<stop stop-color="#02062B" stop-opacity="0.4"/>
<stop offset="1" stop-color="#02062B"/>
</linearGradient>
<linearGradient id="paint2_linear_16499_661" x1="12.677" y1="0.599976" x2="12.677" y2="23.4" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1.0001" stop-color="#F8F8F8" stop-opacity="0.9"/>
</linearGradient>
</defs>
</svg>

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