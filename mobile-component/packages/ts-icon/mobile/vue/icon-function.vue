<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <!-- #ifdef H5 -->
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M15.531 4.254c.001.269-.1.528-.282.725a.94.94 0 0 1-.711.303.73.73 0 0 1-.638-.262 3 3 0 0 1-.404-.86.9.9 0 0 0-.184-.35.41.41 0 0 0-.33-.12.43.43 0 0 0-.394.205 1.9 1.9 0 0 0-.233.545l-1.202 3.848h1.667l-.282.895h-1.655l-1.73 5.554a33 33 0 0 1-1.238 3.411 6.4 6.4 0 0 1-1.558 2.142 3.72 3.72 0 0 1-2.55.894 2.7 2.7 0 0 1-1.706-.472 1.35 1.35 0 0 1-.601-1.065c0-.294.114-.577.319-.788a1.06 1.06 0 0 1 .821-.338.87.87 0 0 1 .797.315c.138.253.218.534.233.823.037.435.234.665.576.665a.96.96 0 0 0 .835-.545 8.3 8.3 0 0 0 .674-1.694l2.771-8.894h-1.75l.27-.895H8.8l.184-.63q.332-1.191.858-2.312c.326-.683.799-1.286 1.385-1.766a3.42 3.42 0 0 1 2.306-.774c.334 0 .666.058.981.17.286.096.543.263.748.484.18.221.276.5.27.786m6.965 5.094c.001.407-.06.811-.184 1.198h-.957c.125-.395.191-.807.197-1.221a.56.56 0 0 0-.073-.278.3.3 0 0 0-.294-.146.42.42 0 0 0-.27.085c-.197.17-.368.35-.553.533l-1.851 1.912.834 2.59q.12.36.282.701c.099.182.209.279.344.279.234 0 .441-.181.626-.525q.245-.446.394-.932h.894a5.3 5.3 0 0 1-.772 1.73c-.266.396-.613.73-1.019.981a2.1 2.1 0 0 1-1.03.303 1.42 1.42 0 0 1-1.201-.533 5 5 0 0 1-.723-1.512l-.38-1.222-2.17 2.287c-.39.51-.953.86-1.583.98-.59 0-.871-.375-.871-1.138.001-.558.118-1.11.343-1.621h1.079c-.175.415-.299.85-.368 1.295 0 .206.062.303.184.303s.282-.12.553-.394l2.538-2.65-.49-1.525c-.074-.23-.147-.459-.234-.69a.95.95 0 0 0-.22-.35.48.48 0 0 0-.331-.131c-.38 0-.7.484-.956 1.443h-.908a7.8 7.8 0 0 1 .736-1.706c.235-.407.552-.761.931-1.04a1.88 1.88 0 0 1 1.104-.364 1.59 1.59 0 0 1 1.25.545c.354.44.616.946.773 1.488l.159.496 1.532-1.622c.397-.501.972-.83 1.606-.918a.89.89 0 0 1 .908.447c.1.297.158.607.17.921z"/></svg>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <image :src="imgSrc" class="icon-image" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
<!-- #ifndef H5 -->
import imgSrc from '@/uni_modules/@zpackage/mobile-package/ts-icon/mobile/uvue/icon-function/function.png'
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