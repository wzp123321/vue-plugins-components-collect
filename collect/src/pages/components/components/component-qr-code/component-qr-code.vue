<template>
  <div class="component-qr-code">
    <section class="cqc-header">
      <a-input v-model:value="text" placeholder="输入你想生成二维码的文本" />
      <a-button @click="generateQRCode">生成二维码</a-button>
    </section>
    <section class="cqc-container">
      <canvas ref="qrcodeCanvas"></canvas>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import QRCode from 'qrcode';

const qrcodeCanvas = ref<InstanceType<typeof HTMLElement>>();
const text = ref('');

const generateQRCode = () => {
  console.log(text.value);
  QRCode.toCanvas(qrcodeCanvas.value!, text.value, (error: any) => {
    if (error) console.error(error);
    console.log('二维码生成成功！');
  });
};

defineOptions({
  name: 'ComponentQrCode',
});
</script>
<style lang="less" scoped>
.component-qr-code {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .cqc-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cqc-container {
    flex: auto;
  }
}
</style>
