<template>
  <div class="plugins-draggable-formula">
    <!-- vuedraggable插件 -->
    <!-- 参考https://segmentfault.com/a/1190000021376720 -->
    <pdf-index-list></pdf-index-list>
    <pdf-judgement-condition></pdf-judgement-condition>
  </div>
</template>
<script lang="ts" setup>
import PdfIndexList from './components/pdf-index-list/pdf-index-list.vue';
import PdfJudgementCondition from './components/pdf-judgement-condition/pdf-judgement-condition.vue';
</script>
<style lang="less" scoped>
.plugins-draggable-formula {
  width: 100%;
  height: 100%;

  background-color: #fff;
  display: grid;
  grid-template-columns: 200px auto;
}
</style>
