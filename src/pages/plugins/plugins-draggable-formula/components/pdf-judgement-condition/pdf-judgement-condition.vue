<template>
  <div class="pdf-judgement-condition">
    <pdf-tool-bar></pdf-tool-bar>
    <div class="pjc-container">
      <pdf-expression-container></pdf-expression-container>
    </div>
  </div>
</template>
<script lang="ts" setup>
import PdfToolBar from '../pdf-tool-bar/pdf-tool-bar.vue';
import PdfExpressionContainer from '../pdf-expression-container/pdf-expression-container.vue';
</script>
<style lang="less" scoped>
.pdf-judgement-condition {
  height: 100%;

  .pjc-container {
    padding: 16px;
  }
}
</style>
