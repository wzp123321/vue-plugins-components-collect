<template>
  <h1>水平等分</h1>
  <div class="ce-grid-halve">
    <div class="one item"><h1>1211111111111111111111111111111111111111111111111111111111111111111111111111</h1></div>
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

.ce-grid-halve {
  display: grid;

  grid-template-columns: repeat(auto-fill, 400px);
  /*  声明行间距和列间距  */
  grid-gap: 20px;
  /*  声明行的高度  */
  grid-auto-rows: 160px;
}
</style>
