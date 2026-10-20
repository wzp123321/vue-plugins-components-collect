<template>
  <div class="pdf-page">
    <header class="pdf-page__head">
      <h3 class="pdf-page__title">前端生成 PDF：打印样式 + 截图两条路线</h3>
      <p class="pdf-page__desc">
        中文 PDF 不引字体包的实用解法：① @media print 精确排版走浏览器「另存为 PDF」（矢量、可选文本）；
        ② html2canvas 整页转图（所见即所得，但文字不可选）。
      </p>
    </header>

    <div class="pdf-page__layout">
      <!-- 打印目标：只有这块会出现在 PDF 里 -->
      <div class="pdf-doc" id="pdf-doc">
        <h4 class="pdf-doc__title">付款回单</h4>
        <table class="pdf-doc__table">
          <tbody>
            <tr><th>回单编号</th><td>PAY-2026-10200045</td></tr>
            <tr><th>付款方</th><td>前端能力实验室（模拟）</td></tr>
            <tr><th>金额</th><td class="amount">¥ 12,800.00</td></tr>
            <tr><th>事由</th><td>组件库私有包发布服务费</td></tr>
            <tr><th>日期</th><td>2026-10-20</td></tr>
          </tbody>
        </table>
        <p class="pdf-doc__foot">本回单由前端能力收集站生成 · 打印后与系统记录一致</p>
      </div>

      <div class="pdf-side">
        <button class="pdf-side__btn pdf-side__btn--primary" @click="printDoc">
          🖨 打印 / 另存为 PDF（矢量）
        </button>
        <button class="pdf-side__btn" :disabled="busy" @click="exportImage">
          {{ busy ? '生成中…' : '🖼 html2canvas → PNG' }}
        </button>

        <ul class="pdf-side__list">
          <li>打印路线：@media print 里隐藏 app 壳、只留票据节点，@page 控制页边距</li>
          <li>截图路线：适合图表/富样式回单，导出 PNG 后亦可塞进 PDF</li>
          <li>要求真矢量文本 PDF 时再上 pdfmake——但中文需嵌入约 10MB 的 CJK 字体包，慎选</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import html2canvas from 'html2canvas';

defineOptions({ name: 'PdfExportDemo' });

const busy = ref(false);

/** 路线一：浏览器打印为 PDF（@media print 只保留票据） */
function printDoc() {
  window.print();
}

/** 路线二：html2canvas 导出高清 PNG（可直接嵌 PDF） */
async function exportImage() {
  const doc = document.getElementById('pdf-doc');
  if (!doc) return;
  busy.value = true;
  try {
    const canvas = await html2canvas(doc, { scale: 2, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `receipt-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    busy.value = false;
  }
}
</script>

<style lang="less" scoped>
.pdf-page {
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
    gap: 20px;
    flex-wrap: wrap;
  }
}

/* 票据本体：白底黑字，模拟纸质单据 */
.pdf-doc {
  width: 380px;
  padding: 26px;
  border-radius: 10px;
  background: #ffffff;
  color: #1a1d29;

  &__title {
    margin: 0 0 18px;
    font-size: 18px;
    text-align: center;
    letter-spacing: 0.4em;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th,
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e5ee;
      text-align: left;
    }

    th {
      width: 84px;
      color: #7a8093;
      font-weight: 500;
    }

    .amount {
      color: #d64545;
      font-weight: 600;
    }
  }

  &__foot {
    margin: 18px 0 0;
    color: #9aa1b2;
    font-size: 10.5px;
    text-align: center;
  }
}

.pdf-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 340px;

  &__btn {
    height: 38px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-surface);
    color: var(--ai-text-dim);
    font-size: 13px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
    }

    &--primary {
      background: var(--ai-gradient);
      border: 0;
      color: #fff;
      font-weight: 500;
    }
  }

  &__list {
    margin: 6px 0 0;
    padding-left: 18px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.8;
  }
}
</style>

<!-- 打印态必须是非 scoped 全局样式：scoped 会附加属性选择器导致 body * 匹配不到 -->
<style lang="less">
@media print {
  body * {
    visibility: hidden;
  }

  #pdf-doc,
  #pdf-doc * {
    visibility: visible;
  }

  #pdf-doc {
    position: fixed;
    inset: 0;
    margin: auto;
    width: 420px;
    height: fit-content;
    box-shadow: none;
  }
}
</style>
