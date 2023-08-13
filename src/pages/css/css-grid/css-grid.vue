<template>
  <div class="css-grid">
    <cssGridFixedWidth></cssGridFixedWidth>
    <cssGridHalve></cssGridHalve>
    <cssGridAuto></cssGridAuto>
    <cssGridCenter></cssGridCenter>
    <cssGridSpaceBetween></cssGridSpaceBetween>
    <cssGridGrail></cssGridGrail>
    <cssGridReseau></cssGridReseau>
  </div>
</template>
<script lang="ts" setup>
/**
 * auto-fill 关键字：表示自动填充，让一行（或者一列）中尽可能的容纳更多的单元格。grid-template-columns: repeat(auto-fill, 200px)
 * 表示列宽是 200 px，但列的数量是不固定的，只要浏览器能够容纳得下，就可以放置元素，代码以及效果如下图所示：
 */
import cssGridHalve from './css-grid-halve.vue';
import cssGridFixedWidth from './css-grid-fixed-width.vue';
import cssGridAuto from './css-grid-auto.vue';
import cssGridCenter from './css-grid-center.vue';
import cssGridSpaceBetween from './css-grid-space-between.vue';
import cssGridGrail from './css-grid-grail.vue';
import cssGridReseau from './css-grid-reseau.vue';
</script>
<style lang="less" scoped>
.css-grid {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
