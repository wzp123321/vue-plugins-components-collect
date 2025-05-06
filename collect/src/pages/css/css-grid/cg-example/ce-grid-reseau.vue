<template>
  <h1>基于网格线布局</h1>
  <div class="ce-grid-reseau">
    <div class="item a">a</div>
    <div class="item b">b</div>
    <div class="item c">b</div>
    <div class="item d">d</div>
  </div>
  <div class="wrapper">
    <div class="one item">One</div>
    <div class="two item">Two</div>
    <div class="three item">Three</div>
    <div class="four item">Four</div>
    <div class="five item">Five</div>
    <div class="six item">Six</div>
  </div>
</template>
<script lang="ts" setup>
/**
 * grid-column CSS 属性是 grid-column-start (en-US) 和 grid-column-end (en-US) 的简写属性，
 * 用于指定网格项目的大小和位置{ 通过为它的网格位置贡献线条，跨度或不添加任何内容（自动），从而指定其 grid area。
 */
</script>
<style lang="less" scoped>
.ce-grid-reseau {
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
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  grid-auto-rows: minmax(100px, auto);

  .one {
    grid-column: 1 / 2;
    grid-row: 1;
    background: #19caad;
  }
  .two {
    grid-column: 2 / 4;
    grid-row: 1 / 3;
    background: #8cc7b5;
  }
  .three {
    grid-row: 2 / 5;
    grid-column: 1;
    background: #d1ba74;
  }
  .four {
    grid-column: 3;
    grid-row: 3;
    background: #bee7e9;
  }
  .five {
    grid-column: 2;
    grid-row: 3/5;
    background: #e6ceac;
  }
  .six {
    grid-column: 3;
    grid-row: 4;
    background: #ecad9e;
  }
  .item {
    text-align: center;
    font-size: 200%;
    color: #fff;
  }
}
</style>
