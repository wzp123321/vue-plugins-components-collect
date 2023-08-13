<template>
  <h1>固定宽度</h1>
  <div class="css-grid-fixed-width">
    <div class="one item">One</div>
    <div class="two item">Two</div>
    <div class="three item">Three</div>
    <div class="four item">Four</div>
    <div class="five item">Five</div>
    <div class="six item">Six</div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
@import (once) './style.css';
.css-grid-fixed-width {
  display: grid;
  grid-template-columns: 500px 300px 400px;
  /*  声明行间距和列间距  */
  grid-gap: 20px;
  /*  声明行的高度  */
  grid-template-rows: 100px 200px;
}
</style>
