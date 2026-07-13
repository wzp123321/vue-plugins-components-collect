<template>
  <div class="tpq-print-brother">
    <el-alert title="Brother 兄弟打印机模式" type="warning" :closable="false" show-icon />
    <p class="tpq-tip">实际环境中调用 bpac 插件打印标签</p>
    <div class="tpq-preview">
      <div class="tpq-label">
        <div class="tpq-label-name">{{ content }}</div>
        <canvas ref="canvasRef" class="tpq-canvas"></canvas>
      </div>
    </div>
    <el-button type="primary" :loading="printing" @click="doPrint">发送到兄弟打印机</el-button>
    <p v-if="lastLog" class="tpq-log">{{ lastLog }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { ElAlert, ElButton } from 'element-plus';

const props = defineProps<{ content: string }>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const printing = ref(false);
const lastLog = ref('');

const draw = async () => {
  if (!canvasRef.value) return;
  try {
    await QRCode.toCanvas(canvasRef.value, props.content, { width: 120 });
  } catch (e) {
    console.error(e);
  }
};

onMounted(draw);
watch(() => props.content, draw);

const doPrint = async () => {
  printing.value = true;
  lastLog.value = '正在初始化 BPAC 设备...';
  await new Promise((r) => setTimeout(r, 600));
  lastLog.value = `Brother 标签已发送到设备: ${props.content}`;
  printing.value = false;
};
</script>

<style lang="less" scoped>
.tpq-print-brother { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.tpq-tip { color: #909399; font-size: 12px; margin: 0; }
.tpq-label {
  border: 1px dashed #c0c4cc;
  padding: 12px;
  background: #fff;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.tpq-label-name { font-size: 13px; }
.tpq-log { color: #67c23a; font-size: 12px; margin: 0; }
</style>
