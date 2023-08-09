<template>
  <h1>水平垂直居中</h1>
  <div class="css-grid-center">
    <main class="one"></main>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
@import (once) './style.css';

.css-grid-center {
  display: grid;
  place-content: center;
  min-height: 300px;

  main {
    min-width: 240px;
    height: 240px;
  }
}
</style>
