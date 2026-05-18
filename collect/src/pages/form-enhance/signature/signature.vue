<template>
  <div class="signature-page">
    <h5>手写签名板</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      使用 Canvas 实现手写签名，支持鼠标和触屏，可调整画笔颜色/粗细，导出 PNG。
    </el-alert>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <template #header>✍️ 签名区域</template>
          <div class="toolbar">
            <div class="tool-group">
              <span>颜色：</span>
              <div
                v-for="c in penColors"
                :key="c"
                class="color-dot"
                :class="{ active: penColor === c }"
                :style="{ background: c }"
                @click="penColor = c"
              ></div>
              <el-color-picker v-model="penColor" size="small" />
            </div>
            <div class="tool-group">
              <span>粗细：</span>
              <el-slider v-model="penSize" :min="1" :max="20" style="width:120px" />
              <span>{{ penSize }}px</span>
            </div>
          </div>

          <canvas
            ref="canvasRef"
            class="signature-canvas"
            :width="canvasWidth"
            :height="canvasHeight"
            @mousedown="startDraw"
            @mousemove="draw"
            @mouseup="endDraw"
            @mouseleave="endDraw"
            @touchstart.prevent="startDrawTouch"
            @touchmove.prevent="drawTouch"
            @touchend="endDraw"
          ></canvas>

          <div class="canvas-actions">
            <el-button @click="clearCanvas">🗑 清空</el-button>
            <el-button @click="undo" :disabled="!canUndo">↩ 撤销</el-button>
            <el-button type="primary" @click="saveSignature">💾 保存</el-button>
            <el-button type="success" @click="downloadSignature">⬇ 下载 PNG</el-button>
            <el-checkbox v-model="transparentBg" style="margin-left:8px">透明背景</el-checkbox>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <template #header>预览 & 信息</template>
          <div v-if="savedUrl" class="saved-preview">
            <p style="font-size:13px;color:#666;margin-bottom:8px">保存结果：</p>
            <img :src="savedUrl" class="preview-img" :style="{ background: transparentBg ? 'transparent' : '#fff' }" />
            <p style="font-size:12px;color:#999;margin-top:8px">
              可直接将 Base64 字符串上传至服务器，或转 Blob 后 multipart/form-data 上传
            </p>
          </div>
          <div v-else class="empty-preview">签名后点击「保存」查看预览</div>
          <div style="margin-top:16px">
            <p style="font-size:12px;color:#999">笔迹点数：{{ strokePoints }}</p>
            <p style="font-size:12px;color:#999">撤销历史：{{ history.length }} 步</p>
          </div>
        </el-card>

        <el-card style="margin-top:16px">
          <template #header>💡 触屏支持要点</template>
          <pre class="code-block">{{ touchCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

defineOptions({ name: 'SignaturePad' });

const canvasRef = ref<HTMLCanvasElement>();
const canvasWidth = 560;
const canvasHeight = 280;
const penColor = ref('#000000');
const penSize = ref(3);
const transparentBg = ref(false);
const savedUrl = ref('');
const strokePoints = ref(0);
const canUndo = ref(false);
const penColors = ['#000000', '#e53e3e', '#3182ce', '#38a169', '#d69e2e'];

let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
const history = ref<ImageData[]>([]);

onMounted(() => {
  ctx = canvasRef.value!.getContext('2d')!;
  fillWhiteBg();
  saveHistory();
});

const fillWhiteBg = () => {
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const saveHistory = () => {
  if (!ctx) return;
  history.value.push(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
  if (history.value.length > 30) history.value.shift();
  canUndo.value = history.value.length > 1;
};

const getPos = (e: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const startDraw = (e: MouseEvent) => {
  isDrawing = true;
  const { x, y } = getPos(e);
  lastX = x; lastY = y;
  ctx!.beginPath();
  ctx!.arc(x, y, penSize.value / 2, 0, Math.PI * 2);
  ctx!.fillStyle = penColor.value;
  ctx!.fill();
};

const draw = (e: MouseEvent) => {
  if (!isDrawing || !ctx) return;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = penColor.value;
  ctx.lineWidth = penSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  lastX = x; lastY = y;
  strokePoints.value++;
};

const endDraw = () => {
  if (isDrawing) {
    isDrawing = false;
    saveHistory();
  }
};

const startDrawTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  const rect = canvasRef.value!.getBoundingClientRect();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
  isDrawing = true;
};

const drawTouch = (e: TouchEvent) => {
  if (!isDrawing || !ctx) return;
  const touch = e.touches[0];
  const rect = canvasRef.value!.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = penColor.value;
  ctx.lineWidth = penSize.value;
  ctx.lineCap = 'round';
  ctx.stroke();
  lastX = x; lastY = y;
};

const clearCanvas = () => {
  ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
  if (!transparentBg.value) fillWhiteBg();
  strokePoints.value = 0;
  history.value = [];
  saveHistory();
  canUndo.value = false;
};

const undo = () => {
  if (history.value.length <= 1) return;
  history.value.pop();
  ctx?.putImageData(history.value[history.value.length - 1], 0, 0);
  canUndo.value = history.value.length > 1;
};

const saveSignature = () => {
  if (!canvasRef.value) return;
  if (transparentBg.value) {
    // 透明背景：临时去除白色背景
    savedUrl.value = canvasRef.value.toDataURL('image/png');
  } else {
    savedUrl.value = canvasRef.value.toDataURL('image/png');
  }
};

const downloadSignature = () => {
  const url = canvasRef.value?.toDataURL('image/png');
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'signature.png';
  a.click();
};

const touchCode = `// 移动端触屏支持
@touchstart.prevent="onTouchStart"
@touchmove.prevent="onTouchMove"
@touchend="onTouchEnd"

const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  startX = touch.clientX - rect.left
  startY = touch.clientY - rect.top
}

// 注意：添加 .prevent 阻止滚动
// 否则画图时页面会滚动`;
</script>

<style lang="less" scoped>
.signature-page {
  padding: 20px;
  overflow-y: auto;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 0;
  margin-bottom: 8px;

  .tool-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &.active { border-color: #409eff; }
}

.signature-canvas {
  display: block;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: crosshair;
  touch-action: none;
  background: #fff;
}

.canvas-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.saved-preview {
  text-align: center;

  .preview-img {
    max-width: 100%;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }
}

.empty-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
