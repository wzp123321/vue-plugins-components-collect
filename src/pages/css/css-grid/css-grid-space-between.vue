<template>
  <h1>两端对齐-宽度固定</h1>
  <div class="css-grid-space-between-fix-width">
    <div class="item one">1</div>
    <div class="item two">2</div>
    <div class="item three">3</div>
    <div class="item four">4</div>
    <div class="item five">5</div>
    <div class="item six">6</div>
    <div class="item seven">7</div>
    <div class="item eight">8</div>
    <div class="item nine">9</div>
    <div class="item ten">10</div>
  </div>
  <h1>两端对齐-宽度不固定</h1>
  <div class="css-grid-space-between-auto-width">
    <div class="item one">11111111111111111111111111111111111111</div>
    <div class="item two">2</div>
    <div class="item three">3</div>
    <div class="item four">4</div>
    <div class="item five">5</div>
    <div class="item six">6</div>
    <div class="item seven">7</div>
    <div class="item eight">8</div>
    <div class="item nine">9</div>
    <div class="item ten">10</div>
    <div class="item one">1</div>
    <div class="item two">2</div>
    <div class="item three">3</div>
    <div class="item four">4</div>
    <div class="item five">5</div>
    <div class="item six">6</div>
    <div class="item seven">7</div>
    <div class="item eight">8</div>
    <div class="item nine">9</div>
    <div class="item ten">10</div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
@import (once) './style.css';

.css-grid-space-between-fix-width {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  justify-content: space-between;
  gap: 36px;

  .item {
    width: 100px;
    height: 100px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    line-height: 100px;
  }
}

.css-grid-space-between-auto-width {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: minmax(100px, auto);
  gap: 30px;
  .item {
    border: 1px solid;
  }
}
</style>
