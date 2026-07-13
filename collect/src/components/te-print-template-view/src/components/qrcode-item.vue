<template>
  <div
    class="tptv-item tptv-item-qrcode"
    :style="containerStyle"
  >
    <canvas ref="canvasRef"></canvas>
    <div v-if="!content" class="tptv-empty">二维码占位</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import QRCode from 'qrcode';

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

const draw = async () => {
  if (!canvasRef.value || !content.value) return;
  try {
    await QRCode.toCanvas(canvasRef.value, content.value, { width: 200, margin: 0 });
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => nextTick(draw));
watch(content, () => nextTick(draw));
</script>

<style lang="less" scoped>
.tptv-item-qrcode {
  canvas { width: 100%; height: 100%; }
}
.tptv-empty {
  color: #909399;
  font-size: 3mm;
  text-align: center;
}
</style>
