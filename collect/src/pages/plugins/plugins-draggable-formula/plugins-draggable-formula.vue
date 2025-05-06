<template>
  <div class="plugins-draggable-formula">
    <!-- 参考https://segmentfault.com/a/1190000021376720 -->
    <pdf-tool-bar></pdf-tool-bar>
    <pdf-index-list></pdf-index-list>
    <!-- 内容区 -->
    <pdf-home></pdf-home>
  </div>
</template>
<script lang="ts" setup>
import PdfIndexList from './components/pdf-index-list/pdf-index-list.vue';
import PdfHome from './components/pdf-home/pdf-home.vue';
import PdfToolBar from './components/pdf-tool-bar/pdf-tool-bar.vue';
</script>
<style lang="less" scoped>
.plugins-draggable-formula {
  width: 100%;
  height: 100%;
  overflow: hidden;

  background-color: #fff;
  display: grid;
  grid-template-columns: 200px auto;
  grid-template-rows: 48px auto;

  .pdf-tool-bar {
    grid-column: 1/4;
  }

  .pdf-home {
    grid-column: 2/4;
  }
}
</style>
