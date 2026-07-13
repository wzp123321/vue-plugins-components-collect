<template>
  <div
    class="tptv-item tptv-item-barcode"
    :style="containerStyle"
  >
    <canvas ref="canvasRef"></canvas>
    <div v-if="!content" class="tptv-empty">条形码占位</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps<{ item: any }>();
const canvasRef = ref<HTMLCanvasElement | null>(null);

const containerStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${props.item.x}mm`,
  top: `${props.item.y}mm`,
  width: `${props.item.width}mm`,
  height: `${props.item.height}mm`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const content = computed(() => (props.item.content as string) || '');

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas || !content.value) return;
  const W = 200, H = 100;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  let seed = 0;
  for (let i = 0; i < content.value.length; i++) seed = (seed * 31 + content.value.charCodeAt(i)) & 0xffff;
  let x = 10;
  while (x < W - 10) {
    const w = (seed = (seed * 9301 + 49297) & 0xffff) % 4 + 1;
    if (w % 2 === 0) ctx.fillRect(x, 5, w, H - 25);
    x += w + 2;
  }
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(content.value, W / 2, H - 6);
};

onMounted(() => nextTick(draw));
watch(content, () => nextTick(draw));
</script>

<style lang="less" scoped>
.tptv-item-barcode { canvas { width: 100%; height: 100%; } }
.tptv-empty { color: #909399; font-size: 3mm; }
</style>
