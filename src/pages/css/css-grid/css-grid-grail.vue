<template>
  <h1>圣杯布局</h1>
  <div class="css-grid-grail">
    <header>header</header>
    <aside>aside-left</aside>
    <article>article</article>
    <aside>aside-right</aside>
    <footer>footer</footer>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.css-grid-grail {
  display: grid;
  grid-template-columns: 150px auto 150px;
  grid-auto-rows: minmax(150px, auto);
  gap: 1em;

  header,
  footer {
    grid-column: 1/4;
  }

  header,
  aside,
  article,
  footer {
    background-color: #eaeaea;
    text-align: center;
  }
}
</style>
