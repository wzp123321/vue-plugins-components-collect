<template>
  <view
    class="icon"
    :class="$attrs.class"
    :style="[iconStyle, $attrs.style]"
    :hover-class="hoverClass"
    @tap="onTap"
  >
    <svg class="icon-svg" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="M4 4a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2zm16.837 1.606c.132-.257-.062-.556-.38-.583l-.565-.042-.464-.026-.527-.02-.585-.011h-.61l-.555.01-.504.018-.65.036-.51.04c-.296.026-.461.298-.332.552l.15.289.19.346.228.398q.06.105.129.217l.288.467.322.496.31.455q.075.108.148.208l.274.375.242.318.206.261c.183.226.53.235.704.02l.326-.415.263-.35.292-.408q.23-.326.48-.71l.156-.243.282-.457.244-.416.108-.19.188-.345zm0 10c.132-.258-.062-.556-.38-.583l-.565-.043-.464-.025-.527-.02-.585-.011h-.61l-.555.01-.504.018-.448.023-.558.04-.154.012c-.296.027-.461.299-.332.553l.15.288.19.346.228.399q.06.105.129.217l.288.467.16.248q.164.255.32.482l.3.429.274.375.242.318.206.26c.183.227.53.236.704.021l.326-.415.263-.35.292-.408q.23-.326.48-.71l.301-.476.264-.437q.121-.209.225-.394l.188-.344zM3 12a1 1 0 0 1 1-1h8a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1m1 6a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2z"/></svg>
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