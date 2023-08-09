<template>
  <h1>基于网格线布局</h1>
  <div class="css-grid-reseau">
    <div class="item a">a</div>
    <div class="item b">b</div>
    <div class="item c">b</div>
    <div class="item d">d</div>
  </div>
</template>
<script lang="ts" setup>
/**
 * grid-column CSS 属性是 grid-column-start (en-US) 和 grid-column-end (en-US) 的简写属性，
 * 用于指定网格项目的大小和位置{ 通过为它的网格位置贡献线条，跨度或不添加任何内容（自动），从而指定其 grid area。
 */
</script>
<style lang="less" scoped>
.css-grid-reseau {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 150px;
  gap: 16px;

  .a {
    grid-column: 1/3;
    grid-row: 1;
  }

  .b {
    grid-column: 3;
    grid-row: 1/3;
  }

  .c {
    grid-column: 1;
    grid-row: 2;
  }

  .d {
    grid-column: 2;
    grid-row: 2;
  }

  .item {
    background-color: #aaa;
    border-radius: 4px;
    color: #fff;
    font-size: 16px;
  }
}
</style>
