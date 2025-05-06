<template>
  <h1>圣杯布局</h1>
  <div class="ce-grid-grail">
    <header>header</header>
    <aside>aside-left</aside>
    <article>article</article>
    <!-- <aside>aside-right</aside>
    <footer>footer</footer> -->
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.ce-grid-grail {
  display: grid;
  grid-template-columns: 160px auto;
  grid-auto-rows: auto 72px;
  gap: 1em;

  header,
  footer {
    grid-column: 2/3;
  }

  aside {
    grid-row: 1/3;
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
