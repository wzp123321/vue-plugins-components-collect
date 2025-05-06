<template>
  <h1>一侧固定一侧自适应</h1>
  <div class="ce-grid-auto">
    <aside></aside>
    <main></main>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
@import (once) './style.css';
.ce-grid-auto {
  display: grid;
  grid-template-columns: 200px auto;
  height: 200px;

  aside {
    background-color: red;
  }

  main {
    background-color: lightblue;
  }
}
</style>
