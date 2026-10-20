<template>
  <div class="shot-page">
    <header class="shot-page__head">
      <h3 class="shot-page__title">页面截图（html2canvas）</h3>
      <p class="shot-page__desc">
        把 DOM 渲染成 Canvas → 导出 PNG。典型用途：数据卡片分享图、报表快照、带水印的证据留存。
      </p>
    </header>

    <div class="shot-page__layout">
      <!-- 被截图的目标区域 -->
      <div id="shot-target" class="shot-target">
        <div class="shot-target__brand">FRONTEND CAPABILITY LAB</div>
        <h4 class="shot-target__title">2026 Q4 前端效能报告</h4>
        <table class="shot-target__table">
          <thead>
            <tr><th>指标</th><th>本月</th><th>环比</th></tr>
          </thead>
          <tbody>
            <tr><td>构建时长</td><td>1m51s</td><td class="good">-12%</td></tr>
            <tr><td>组件复用率</td><td>63%</td><td class="good">+8%</td></tr>
            <tr><td>线上缺陷</td><td>4</td><td class="bad">+1</td></tr>
          </tbody>
        </table>
        <div class="shot-target__watermark">wanzp · 2026-10-20</div>
      </div>

      <div class="shot-side">
        <label class="shot-side__option">
          <input v-model="withWatermark" type="checkbox" />
          截图时叠加站名水印
        </label>

        <button class="shot-side__btn shot-side__btn--primary" :disabled="busy" @click="capture">
          {{ busy ? '生成中…' : '📸 生成截图' }}
        </button>
        <button class="shot-side__btn" :disabled="!shotUrl" @click="download">⬇ 下载 PNG</button>

        <p class="shot-side__tip">
          坑位提示：跨域图片要先设 useCORS + 服务端 CORS 头；position: fixed
          的元素会被拉直进画布，截图区域建议脱离 fixed 布局。
        </p>

        <img v-if="shotUrl" :src="shotUrl" class="shot-side__preview" alt="截图预览" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import html2canvas from 'html2canvas';

defineOptions({ name: 'ScreenshotCaptureDemo' });

const withWatermark = ref(true);
const busy = ref(false);
const shotUrl = ref('');

async function capture() {
  const target = document.getElementById('shot-target');
  if (!target) return;
  busy.value = true;
  try {
    const canvas = await html2canvas(target, {
      scale: 2, // 2 倍采样，文字不糊
      backgroundColor: '#151721',
      useCORS: true,
    });
    if (withWatermark.value) stampWatermark(canvas);
    shotUrl.value = canvas.toDataURL('image/png');
  } finally {
    busy.value = false;
  }
}

/** 在 canvas 上平铺站名水印后再导出 */
function stampWatermark(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px sans-serif';
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 12);
  for (let y = -canvas.height; y < canvas.height; y += 90) {
    for (let x = -canvas.width; x < canvas.width; x += 320) {
      ctx.fillText('CAPABILITY LAB', x, y);
    }
  }
  ctx.restore();
}

function download() {
  if (!shotUrl.value) return;
  const link = document.createElement('a');
  link.download = `report-${Date.now()}.png`;
  link.href = shotUrl.value;
  link.click();
}
</script>

<style lang="less" scoped>
.shot-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  &__layout {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
}

/* 被截图的目标卡片：样式刻意丰富，验证 html2canvas 还原度 */
.shot-target {
  width: 360px;
  padding: 22px;
  border-radius: 14px;
  background: linear-gradient(150deg, #2b2452, #14162b 60%);
  border: 1px solid rgba(124, 92, 255, 0.5);
  color: #eef0f7;

  &__brand {
    color: rgba(167, 139, 250, 0.8);
    font-family: var(--ai-font-mono);
    font-size: 9px;
    letter-spacing: 0.22em;
  }

  &__title {
    margin: 10px 0 16px;
    font-size: 19px;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;

    th,
    td {
      padding: 8px 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      text-align: left;
    }

    th {
      color: rgba(238, 240, 247, 0.55);
      font-weight: 500;
    }

    .good {
      color: #34d399;
    }

    .bad {
      color: #f87171;
    }
  }

  &__watermark {
    margin-top: 16px;
    text-align: right;
    color: rgba(238, 240, 247, 0.4);
    font-size: 10px;
  }
}

.shot-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;

  &__option {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ai-text-dim);
    font-size: 12.5px;
    cursor: pointer;
  }

  &__btn {
    height: 36px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-surface);
    color: var(--ai-text-dim);
    font-size: 13px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--primary {
      background: var(--ai-gradient);
      border: 0;
      color: #fff;
      font-weight: 500;
    }
  }

  &__tip {
    margin: 4px 0 0;
    color: var(--ai-text-mute);
    font-size: 11px;
    line-height: 1.7;
  }

  &__preview {
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--ai-border);
  }
}
</style>
