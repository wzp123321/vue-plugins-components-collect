<template>
  <div class="qr-code-demo">
    <header class="qcd-demo-header">
      <h3>qr-code — 文本转二维码</h3>
      <p>基于 <code>qrcode</code> 库，在 canvas 上实时渲染任意文本对应的二维码。</p>
    </header>
    <div class="qcd-demo-stage">
      <el-card class="qcd-card">
        <template #header><span>基础用法</span></template>
        <p class="qcd-tip">在输入框填文本，点击"生成二维码"按钮即可生成。再次点击会重绘同一 canvas。</p>
        <qr-code />
      </el-card>

      <el-card class="qcd-card">
        <template #header><span>组件源码</span></template>
        <pre class="qcd-pre">{{ source }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElCard } from 'element-plus';
import { QrCode } from '../../../components/qr-code';

const source = `<template>
  <div class="component-qr-code">
    <section class="cqc-header">
      <el-input v-model="text" placeholder="输入你想生成二维码的文本" />
      <el-button @click="generateQRCode">生成二维码</el-button>
    </section>
    <section class="cqc-container">
      <canvas ref="qrcodeCanvas"></canvas>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import QRCode from 'qrcode';

const qrcodeCanvas = ref();
const text = ref('');

const generateQRCode = () => {
  QRCode.toCanvas(qrcodeCanvas.value!, text.value, (err) => {
    if (err) console.error(err);
  });
};
${'<'}/script>`;

defineOptions({ name: 'QrCodeDemo' });
</script>

<style lang="less" scoped>
.qr-code-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: auto;

  .qcd-demo-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fafbfc;

    h3 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0; color: #909399; font-size: 12px; }
    code { background: #f0f9ff; padding: 1px 4px; border-radius: 2px; color: #409eff; }
  }

  .qcd-demo-stage {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .qcd-card { width: 100%; }
  .qcd-tip { color: #909399; font-size: 12px; margin: 0 0 12px; }
  .qcd-pre {
    background: #fafbfc;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.6;
    color: #303133;
    overflow: auto;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
