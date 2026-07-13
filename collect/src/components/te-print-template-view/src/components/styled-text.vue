<template>
  <div
    class="tptv-item tptv-item-styled"
    :style="containerStyle"
    ref="containerRef"
  >
    <span ref="textRef" :style="textStyle">{{ (item as any).content }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps<{ item: any }>();

const containerRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const transform = ref<{ scaleX: number; letterSpacing: number; origin: string }>({ scaleX: 1, letterSpacing: 0, origin: 'left' });

const containerStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${props.item.x}mm`,
  top: `${props.item.y}mm`,
  width: `${props.item.width}mm`,
  height: `${props.item.height}mm`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}));

const textStyle = computed(() => {
  const base: any = {
    fontSize: `${props.item.fontSize || 4}mm`,
    color: props.item.color || '#000',
    fontWeight: props.item.bold ? 'bold' : 'normal',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    transform: `scaleX(${transform.value.scaleX})`,
    transformOrigin: transform.value.origin,
    letterSpacing: `${transform.value.letterSpacing}px`,
  };
  if (props.item.mirror) {
    base.transform += ' scaleX(-1)';
  }
  return base;
});

const measure = () => {
  if (!containerRef.value || !textRef.value) return;
  const cw = containerRef.value.clientWidth;
  const tw = textRef.value.scrollWidth;
  if (tw < cw) {
    // 撑满: 拉大 letterSpacing
    const text = (props.item.content || '') as string;
    const extra = cw - tw;
    const letterSpacing = text.length > 1 ? extra / (text.length - 1) : 0;
    transform.value = { scaleX: 1, letterSpacing, origin: 'left' };
  } else {
    // 缩放
    const scaleX = cw / tw;
    transform.value = { scaleX, letterSpacing: 0, origin: 'center' };
  }
};

onMounted(() => {
  nextTick(measure);
});
watch(() => [props.item.content, props.item.fontSize, props.item.width, props.item.mirror], () => nextTick(measure), { deep: true });
</script>
