<template>
  <div class="pdf-judgement-condition">
    <pdf-tool-bar></pdf-tool-bar>
    <div class="pjc-container">
      <h1>拖拽区域1</h1>
      <pdf-expression-container identify="test1"></pdf-expression-container>
      <h1>拖拽区域2</h1>
      <pdf-expression-container identify="test2"></pdf-expression-container>
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
