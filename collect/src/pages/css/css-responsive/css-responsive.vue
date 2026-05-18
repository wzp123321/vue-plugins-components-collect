<template>
  <div class="css-responsive-page">
    <h5>响应式设计 — 媒体查询 & 容器查询</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      演示三种现代响应式方案：<strong>媒体查询（@media）</strong>、<strong>容器查询（@container）</strong>、
      <strong>clamp() 流体排版</strong>。缩放窗口查看效果。
    </el-alert>

    <!-- 窗口尺寸显示 -->
    <div class="viewport-indicator">
      <span class="vp-size">{{ vpW }} × {{ vpH }}</span>
      <span class="vp-bp" :class="currentBp.class">{{ currentBp.label }}</span>
    </div>

    <el-row :gutter="16" style="margin-top:16px">
      <!-- 响应式网格 -->
      <el-col :span="24">
        <el-card style="margin-bottom:16px">
          <template #header>① 响应式网格（媒体查询自动换列）</template>
          <div class="responsive-grid">
            <div v-for="i in 6" :key="i" class="grid-item">
              <span class="item-num">{{ i }}</span>
              <p>卡片内容</p>
            </div>
          </div>
          <pre class="code-block" style="margin-top:12px">{{ gridCode }}</pre>
        </el-card>
      </el-col>

      <!-- 容器查询 -->
      <el-col :span="12">
        <el-card>
          <template #header>② 容器查询（@container）</template>
          <p style="font-size:13px;color:#666;margin-bottom:12px">
            拖拽下方容器宽度，卡片根据容器大小自适应布局：
          </p>
          <div class="container-query-wrapper" style="container-type: inline-size; container-name: card-container">
            <div class="cq-card">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='8' fill='%23409eff'/%3E%3Ctext x='40' y='50' text-anchor='middle' fill='white' font-size='32'%3E🖼%3C/text%3E%3C/svg%3E" class="cq-img" />
              <div class="cq-content">
                <h3 class="cq-title">容器查询卡片</h3>
                <p class="cq-desc">当容器宽度 > 400px 时，图片和文字水平排列；当容器较窄时，垂直排列。</p>
                <span class="cq-tag">@container</span>
              </div>
            </div>
          </div>
          <pre class="code-block" style="margin-top:12px">{{ containerCode }}</pre>
        </el-card>
      </el-col>

      <!-- clamp 流体排版 -->
      <el-col :span="12">
        <el-card>
          <template #header>③ clamp() 流体排版</template>
          <div class="fluid-typography">
            <p class="fluid-title">流体标题文字</p>
            <p class="fluid-body">这段文字的大小会随着窗口宽度平滑变化，在最小值和最大值之间自动适配，无需任何断点。</p>
            <div class="fluid-spacing">
              <div class="spacing-box">间距也会流体变化</div>
            </div>
          </div>
          <pre class="code-block" style="margin-top:12px">{{ clampCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'CssResponsive' });

const vpW = ref(window.innerWidth);
const vpH = ref(window.innerHeight);

const breakpoints = [
  { min: 0, label: '📱 手机 XS', class: 'xs' },
  { min: 576, label: '📱 手机 SM', class: 'sm' },
  { min: 768, label: '💊 平板 MD', class: 'md' },
  { min: 992, label: '💻 笔记本 LG', class: 'lg' },
  { min: 1200, label: '🖥 桌面 XL', class: 'xl' },
  { min: 1600, label: '🖥 大屏 2XL', class: 'xxl' },
];

const currentBp = ref(breakpoints[0]);

const updateVp = () => {
  vpW.value = window.innerWidth;
  vpH.value = window.innerHeight;
  currentBp.value = [...breakpoints].reverse().find((bp) => vpW.value >= bp.min) ?? breakpoints[0];
};

onMounted(() => { updateVp(); window.addEventListener('resize', updateVp); });
onUnmounted(() => window.removeEventListener('resize', updateVp));

const gridCode = `.responsive-grid {
  display: grid;
  gap: 16px;
  /* 默认 1 列 */
  grid-template-columns: 1fr;

  /* ≥ 576px: 2 列 */
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* ≥ 992px: 3 列 */
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 或者用 auto-fit 自动列数 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}`;

const containerCode = `/* 1. 设置容器查询上下文 */
.card-wrapper {
  container-type: inline-size;
  container-name: card-container;
}

/* 2. 基于容器宽度而非视口 */
@container card-container (min-width: 400px) {
  .cq-card {
    flex-direction: row;  /* 宽容器：水平排列 */
  }
}

@container card-container (max-width: 399px) {
  .cq-card {
    flex-direction: column;  /* 窄容器：垂直排列 */
  }
}`;

const clampCode = `/* clamp(最小值, 首选值, 最大值) */
/* 随窗口宽度在 24px ~ 48px 间平滑变化 */
.fluid-title {
  font-size: clamp(24px, 4vw + 1rem, 48px);
}

/* 间距流体变化 */
.fluid-spacing {
  padding: clamp(16px, 5vw, 48px);
  margin: clamp(8px, 2vw, 24px);
}

/* 计算响应式宽度（不需要媒体查询）*/
.fluid-container {
  width: min(90%, 1200px);  /* 宽度 = 90vw 和 1200px 中的较小值 */
  margin: 0 auto;
}`;
</script>

<style lang="less" scoped>
.css-responsive-page { padding: 20px; overflow-y: auto; }

.viewport-indicator {
  display: flex; align-items: center; gap: 12px; padding: 8px 16px;
  background: #1e1e2e; border-radius: 8px; font-family: monospace;

  .vp-size { color: #cdd6f4; font-size: 14px; }
  .vp-bp {
    padding: 3px 10px; border-radius: 12px; font-size: 12px;
    &.xs { background: #ff6584; color: #fff; }
    &.sm { background: #ffa726; color: #fff; }
    &.md { background: #42b983; color: #fff; }
    &.lg { background: #409eff; color: #fff; }
    &.xl { background: #722ed1; color: #fff; }
    &.xxl { background: #eb2f96; color: #fff; }
  }
}

.responsive-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

  .grid-item {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 8px; padding: 16px;
    text-align: center; color: #fff;

    .item-num { font-size: 24px; font-weight: 700; }
    p { font-size: 12px; margin-top: 4px; opacity: 0.8; }
  }
}

.container-query-wrapper { resize: horizontal; overflow: hidden; min-width: 160px; max-width: 100%; border: 2px dashed #e4e7ed; padding: 12px; border-radius: 8px; }

.cq-card {
  display: flex; gap: 12px; align-items: flex-start;
  flex-direction: column; transition: flex-direction 0.3s;

  @container card-container (min-width: 400px) {
    flex-direction: row;
    align-items: center;
  }

  .cq-img { width: 80px; height: 80px; border-radius: 8px; flex-shrink: 0; }
  .cq-content { .cq-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; } .cq-desc { font-size: 12px; color: #666; line-height: 1.5; } }
  .cq-tag { display: inline-block; padding: 2px 8px; background: #ecf5ff; color: #409eff; border-radius: 4px; font-size: 11px; margin-top: 6px; }
}

.fluid-typography {
  .fluid-title { font-size: clamp(20px, 3vw, 36px); font-weight: 700; color: #303133; margin-bottom: 12px; }
  .fluid-body { font-size: clamp(13px, 1.5vw, 16px); line-height: 1.7; color: #606266; margin-bottom: 16px; }
  .spacing-box {
    background: #f0f9ff; border-radius: 8px; text-align: center;
    padding: clamp(12px, 2vw, 24px); font-size: 13px; color: #409eff;
  }
}

.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
