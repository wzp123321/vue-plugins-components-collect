<template>
  <div class="tpq-print-lbp">
    <el-alert :title="`浏览器打印模式（${device}）`" type="info" :closable="false" show-icon />
    <p class="tpq-tip">实际环境中调用 vue3-print-nb 打印 canvas 画布</p>
    <canvas ref="canvasRef" class="tpq-canvas"></canvas>
    <el-button type="primary" @click="doPrint">打印</el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { ElAlert, ElButton } from 'element-plus';

const props = defineProps<{ content: string; device?: string }>();
const canvasRef = ref<HTMLCanvasElement | null>(null);

const draw = async () => {
  if (!canvasRef.value) return;
  try {
    await QRCode.toCanvas(canvasRef.value, props.content, { width: 200 });
  } catch (e) {
    console.error(e);
  }
};

onMounted(draw);
watch(() => props.content, draw);

const doPrint = () => {
  if (!canvasRef.value) return;
  const dataUrl = canvasRef.value.toDataURL();
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(`<img src="${dataUrl}" onload="window.print(); window.close();" />`);
  }
};
</script>

<style lang="less" scoped>
.tpq-print-lbp { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.tpq-tip { color: #909399; font-size: 12px; margin: 0; }
.tpq-canvas { border: 1px solid #ebeef5; }
</style>
