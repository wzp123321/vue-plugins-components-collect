<template>
  <div class="cp-display">
    <h1>Display-grid属性</h1>
    <div class="cd-diplay">
      <span>1111111111</span>
      <div class="cd-display-container">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span>22222222</span>
    </div>
    <h1>Display-inline-grid属性</h1>
    <div class="cd-inline-diplay">
      <span>1111111111</span>
      <div class="cd-inline-display-container">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span>22222222</span>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.cp-display {
  width: 100%;
  height: 100%;

  .cd-display-container {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-auto-rows: 100px;
    gap: 10px;

    div {
      background-color: red;
    }
  }

  .cd-inline-display-container {
    display: inline-grid;
    grid-template-columns: repeat(3, 100px);
    grid-auto-rows: 100px;
    gap: 10px;

    div {
      background-color: red;
    }
  }
}
</style>
