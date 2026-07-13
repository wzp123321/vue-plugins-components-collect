<template>
  <div class="tpq-print-postek">
    <el-alert title="Postek RFID 打印机模式" type="success" :closable="false" show-icon />
    <p class="tpq-tip">实际环境中调用 Postek RFID SDK 写入标签</p>
    <div class="tpq-preview">
      <div class="tpq-label">
        <div class="tpq-label-rfid">RFID</div>
        <div class="tpq-label-name">{{ content }}</div>
        <canvas ref="canvasRef" class="tpq-canvas"></canvas>
      </div>
    </div>
    <el-button type="primary" :loading="printing" @click="doPrint">写入 RFID 标签</el-button>
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
  lastLog.value = '正在连接 Postek RFID 设备...';
  await new Promise((r) => setTimeout(r, 600));
  lastLog.value = `RFID 标签已写入: ${props.content}`;
  printing.value = false;
};
</script>

<style lang="less" scoped>
.tpq-print-postek { display: flex; flex-direction: column; gap: 12px; align-items: center; }
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
  position: relative;
}
.tpq-label-rfid {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  background: #67c23a;
  color: #fff;
  padding: 2px 4px;
  border-radius: 2px;
}
.tpq-label-name { font-size: 13px; }
.tpq-log { color: #67c23a; font-size: 12px; margin: 0; }
</style>
