<template>
  <div class="canvas-advance">
    <h5>Canvas 绘图进阶</h5>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>① 粒子动效</template>
          <canvas ref="particleCanvas" width="400" height="260" class="canvas-box"></canvas>
          <div class="ctrl">
            <el-button size="small" @click="toggleParticle">{{ particleRunning ? '暂停' : '开始' }}</el-button>
            <span style="font-size:12px;color:#999">粒子数：{{ particleCount }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>② 时钟绘制</template>
          <canvas ref="clockCanvas" width="400" height="260" class="canvas-box"></canvas>
        </el-card>
      </el-col>

      <el-col :span="12" style="margin-top:20px">
        <el-card>
          <template #header>③ 贝塞尔曲线绘制</template>
          <canvas ref="bezierCanvas" width="400" height="260" class="canvas-box"
            @mousedown="startBezier" @mousemove="previewBezier" @mouseup="endBezier"></canvas>
          <div class="ctrl">
            <el-button size="small" @click="clearBezier">清空</el-button>
            <el-color-picker v-model="bezierColor" size="small" />
            <span style="font-size:12px;color:#999">点击拖拽绘制曲线</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" style="margin-top:20px">
        <el-card>
          <template #header>④ 图像像素操作（滤镜）</template>
          <input ref="filterInput" type="file" accept="image/*" style="display:none" @change="loadFilterImage" />
          <div class="filter-area">
            <canvas ref="filterCanvas" width="380" height="200" class="canvas-box"></canvas>
          </div>
          <div class="ctrl" style="flex-wrap:wrap;gap:6px">
            <el-button size="small" @click="filterInput?.click()">选择图片</el-button>
            <el-button v-for="f in filters" :key="f.name" size="small"
              :type="activeFilter === f.name ? 'primary' : ''"
              @click="applyFilter(f.name)">{{ f.label }}</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'CanvasAdvance' });

// ===== 粒子动效 =====
const particleCanvas = ref<HTMLCanvasElement>();
const particleRunning = ref(false);
const particleCount = ref(60);
let particleCtx: CanvasRenderingContext2D | null = null;
let particleRAF = 0;
interface Particle { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; }
const particles: Particle[] = [];

const initParticles = () => {
  particles.length = 0;
  for (let i = 0; i < particleCount.value; i++) {
    particles.push({
      x: Math.random() * 400, y: Math.random() * 260,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      r: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360},80%,60%)`,
      alpha: Math.random() * 0.8 + 0.2,
    });
  }
};

const drawParticles = () => {
  if (!particleCtx) return;
  particleCtx.clearRect(0, 0, 400, 260);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > 400) p.vx *= -1;
    if (p.y < 0 || p.y > 260) p.vy *= -1;
    particleCtx!.beginPath();
    particleCtx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    particleCtx!.fillStyle = p.color;
    particleCtx!.globalAlpha = p.alpha;
    particleCtx!.fill();
  });
  // 连线
  particleCtx.globalAlpha = 1;
  particles.forEach((a, i) => {
    particles.slice(i + 1).forEach((b) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 80) {
        particleCtx!.beginPath();
        particleCtx!.moveTo(a.x, a.y);
        particleCtx!.lineTo(b.x, b.y);
        particleCtx!.strokeStyle = `rgba(150,150,255,${1 - d / 80})`;
        particleCtx!.lineWidth = 0.5;
        particleCtx!.stroke();
      }
    });
  });
  if (particleRunning.value) particleRAF = requestAnimationFrame(drawParticles);
};

const toggleParticle = () => {
  particleRunning.value = !particleRunning.value;
  if (particleRunning.value) drawParticles();
  else cancelAnimationFrame(particleRAF);
};

// ===== 时钟 =====
const clockCanvas = ref<HTMLCanvasElement>();
let clockCtx: CanvasRenderingContext2D | null = null;
let clockTimer = 0;

const drawClock = () => {
  if (!clockCtx) return;
  const W = 400, H = 260, CX = W / 2, CY = H / 2, R = 110;
  const now = new Date();
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  clockCtx.clearRect(0, 0, W, H);

  // 表盘
  clockCtx.beginPath();
  clockCtx.arc(CX, CY, R, 0, Math.PI * 2);
  clockCtx.fillStyle = '#1a1a2e';
  clockCtx.fill();
  clockCtx.strokeStyle = '#6c63ff';
  clockCtx.lineWidth = 3;
  clockCtx.stroke();

  // 刻度
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isMaj = i % 5 === 0;
    const r1 = isMaj ? R - 14 : R - 8;
    clockCtx.beginPath();
    clockCtx.moveTo(CX + Math.cos(angle) * r1, CY + Math.sin(angle) * r1);
    clockCtx.lineTo(CX + Math.cos(angle) * R, CY + Math.sin(angle) * R);
    clockCtx.strokeStyle = isMaj ? '#fff' : 'rgba(255,255,255,0.3)';
    clockCtx.lineWidth = isMaj ? 2 : 1;
    clockCtx.stroke();
  }

  // 指针
  const drawHand = (angle: number, len: number, width: number, color: string) => {
    clockCtx!.beginPath();
    clockCtx!.moveTo(CX, CY);
    clockCtx!.lineTo(CX + Math.cos(angle) * len, CY + Math.sin(angle) * len);
    clockCtx!.strokeStyle = color;
    clockCtx!.lineWidth = width;
    clockCtx!.lineCap = 'round';
    clockCtx!.stroke();
  };
  drawHand((h / 12 + m / 720) * Math.PI * 2 - Math.PI / 2, 60, 6, '#fff');
  drawHand((m / 60 + s / 3600) * Math.PI * 2 - Math.PI / 2, 85, 4, '#6c63ff');
  drawHand((s / 60) * Math.PI * 2 - Math.PI / 2, 95, 2, '#ff6584');

  // 中心点
  clockCtx.beginPath();
  clockCtx.arc(CX, CY, 5, 0, Math.PI * 2);
  clockCtx.fillStyle = '#ff6584';
  clockCtx.fill();
};

// ===== 贝塞尔曲线 =====
const bezierCanvas = ref<HTMLCanvasElement>();
const bezierColor = ref('#409eff');
let bezierCtx: CanvasRenderingContext2D | null = null;
let bezierDrawing = false;
let bezierStart = { x: 0, y: 0 };
let bezierSaved: ImageData | null = null;

const startBezier = (e: MouseEvent) => {
  if (!bezierCtx) return;
  const rect = bezierCanvas.value!.getBoundingClientRect();
  bezierStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  bezierSaved = bezierCtx.getImageData(0, 0, 400, 260);
  bezierDrawing = true;
};

const previewBezier = (e: MouseEvent) => {
  if (!bezierDrawing || !bezierCtx || !bezierSaved) return;
  const rect = bezierCanvas.value!.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  bezierCtx.putImageData(bezierSaved, 0, 0);
  bezierCtx.beginPath();
  bezierCtx.moveTo(bezierStart.x, bezierStart.y);
  bezierCtx.quadraticCurveTo(mx, bezierStart.y, mx, my);
  bezierCtx.strokeStyle = bezierColor.value;
  bezierCtx.lineWidth = 2;
  bezierCtx.stroke();
};

const endBezier = () => { bezierDrawing = false; bezierSaved = null; };
const clearBezier = () => bezierCtx?.clearRect(0, 0, 400, 260);

// ===== 图像滤镜 =====
const filterCanvas = ref<HTMLCanvasElement>();
const filterInput = ref<HTMLInputElement>();
const activeFilter = ref('normal');
let filterCtx: CanvasRenderingContext2D | null = null;
let originalImageData: ImageData | null = null;
let filterImg: HTMLImageElement | null = null;

const filters = [
  { name: 'normal', label: '原图' },
  { name: 'grayscale', label: '灰度' },
  { name: 'sepia', label: '复古' },
  { name: 'invert', label: '反色' },
  { name: 'blur', label: '模糊' },
  { name: 'brighten', label: '增亮' },
];

const loadFilterImage = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  filterImg = new Image();
  filterImg.onload = () => {
    filterCtx!.drawImage(filterImg!, 0, 0, 380, 200);
    originalImageData = filterCtx!.getImageData(0, 0, 380, 200);
  };
  filterImg.src = url;
};

const applyFilter = (filterName: string) => {
  activeFilter.value = filterName;
  if (!filterCtx || !originalImageData) return;
  const imageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
  const d = imageData.data;
  if (filterName === 'grayscale') {
    for (let i = 0; i < d.length; i += 4) { const g = d[i] * 0.3 + d[i+1] * 0.59 + d[i+2] * 0.11; d[i] = d[i+1] = d[i+2] = g; }
  } else if (filterName === 'sepia') {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      d[i] = Math.min(255, r*0.393+g*0.769+b*0.189);
      d[i+1] = Math.min(255, r*0.349+g*0.686+b*0.168);
      d[i+2] = Math.min(255, r*0.272+g*0.534+b*0.131);
    }
  } else if (filterName === 'invert') {
    for (let i = 0; i < d.length; i += 4) { d[i] = 255-d[i]; d[i+1] = 255-d[i+1]; d[i+2] = 255-d[i+2]; }
  } else if (filterName === 'brighten') {
    for (let i = 0; i < d.length; i += 4) { d[i] = Math.min(255, d[i]+50); d[i+1] = Math.min(255, d[i+1]+50); d[i+2] = Math.min(255, d[i+2]+50); }
  }
  filterCtx.putImageData(imageData, 0, 0);
  if (filterName === 'blur') { filterCtx.putImageData(originalImageData, 0, 0); filterCtx.filter = 'blur(4px)'; filterCtx.drawImage(filterCanvas.value!, 0, 0); filterCtx.filter = 'none'; }
};

onMounted(() => {
  particleCtx = particleCanvas.value!.getContext('2d')!;
  initParticles();
  drawParticles();
  particleRunning.value = true;

  clockCtx = clockCanvas.value!.getContext('2d')!;
  drawClock();
  clockTimer = window.setInterval(drawClock, 1000);

  bezierCtx = bezierCanvas.value!.getContext('2d')!;
  filterCtx = filterCanvas.value!.getContext('2d')!;
  filterCtx.fillStyle = '#f0f2f5';
  filterCtx.fillRect(0, 0, 380, 200);
  filterCtx.fillStyle = '#999';
  filterCtx.font = '14px sans-serif';
  filterCtx.textAlign = 'center';
  filterCtx.fillText('选择图片后在这里查看滤镜效果', 190, 110);
});

onUnmounted(() => {
  cancelAnimationFrame(particleRAF);
  clearInterval(clockTimer);
});
</script>

<style lang="less" scoped>
.canvas-advance {
  padding: 20px;
  overflow-y: auto;
}

.canvas-box {
  display: block;
  border-radius: 8px;
  max-width: 100%;
  background: #f8f9fa;
}

.ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.filter-area {
  overflow: hidden;
}
</style>
