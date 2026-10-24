<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M4 16a1 1 0 0 1 .993.883L5 17v2h2a1 1 0 0 1 .117 1.993L7 21H5a2 2 0 0 1-1.995-1.85L3 19v-2a1 1 0 0 1 1-1M20 16a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2h-2a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 1-1"/><path fill="currentColor" fill-rule="evenodd" d="M6.063 9.363q.407 0 .773.078.367.08.64.264.275.185.436.498.162.311.162.78 0 .566-.294.961-.294.396-.858.5l.814 1.353a.593.593 0 1 1-1.034.58l-.947-1.812h-.582v1.545a.586.586 0 0 1-1.173 0v-3.747a1 1 0 0 1 1-1zm-.884.996v1.211h.691q.158.001.336-.01a1 1 0 0 0 .32-.068.56.56 0 0 0 .238-.178.55.55 0 0 0 .093-.338.55.55 0 0 0-.083-.324.6.6 0 0 0-.21-.185.9.9 0 0 0-.293-.086 2 2 0 0 0-.323-.022z" clip-rule="evenodd"/><path fill="currentColor" d="M11.964 9.363a.543.543 0 0 1 0 1.085h-1.862v1.084h1.681a.542.542 0 0 1 0 1.084h-1.68v1.492a.588.588 0 1 1-1.176 0v-3.745a1 1 0 0 1 1-1zM13.922 9.363c.324 0 .589.264.589.588v4.157a.589.589 0 0 1-1.177 0V9.951c0-.324.263-.587.588-.588"/><path fill="currentColor" fill-rule="evenodd" d="M17.344 9.363q.639.001 1.216.143.576.142 1.006.463.43.319.681.83.254.513.253 1.244 0 .649-.245 1.142a2.5 2.5 0 0 1-.66.828 2.9 2.9 0 0 1-.957.508q-.54.174-1.138.173h-.922a1 1 0 0 1-1-1v-3.33a1 1 0 0 1 1-1zm-.59 1.085v3.164h.611q.409 0 .756-.084.351-.085.606-.274c.17-.13.304-.296.404-.506a1.8 1.8 0 0 0 .147-.764c0-.26-.048-.49-.147-.68a1.35 1.35 0 0 0-.397-.48 1.7 1.7 0 0 0-.583-.282 2.6 2.6 0 0 0-.705-.094z" clip-rule="evenodd"/><path fill="currentColor" d="M7 3a1 1 0 0 1 0 2H5v2a1 1 0 0 1-2 0V5a2 2 0 0 1 2-2zM19 3a2 2 0 0 1 2 2v2a1 1 0 0 1-2 0V5h-2a1 1 0 0 1 0-2z"/></svg>
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