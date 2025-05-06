<template>
  <div class="css-whitespace-wordbreak-wordwrap" id="css-whitespace-wordbreak-wordwrap">
    <div class="cwww-whitespace">
      <h1>cwww-whitespace</h1>
      <div class="cwww-whitespace-container">
        <div class="item">{{ nwrapStr }}</div>
        <div class="item nowrap">{{ nwrapStr }}</div>
        <div class="item pre">{{ nwrapStr }}</div>
        <div class="item prewrap">{{ nwrapStr }}</div>
        <div class="item preline">{{ nwrapStr }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const nwrapStr =
  'This      is a incomprehensibilities long word.我在测\n试 我在    测试&nbsp;&nbsp;&nbsp;&nbsp;我n在测试&nbsp;&nbsp;&nbsp;我在测试br生效<br />在测试我在测试&nbsp;&nbsp;&nbsp;&nbsp;我在测';
</script>
<style lang="less" scoped>
.css-whitespace-wordbreak-wordwrap {
  width: 100%;
  height: 100%;

  .cwww-whitespace-container {
    display: flex;
    flex-direction: column;
    justify-content: start;
    row-gap: 24px;

    .item {
      width: 200px;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .nowrap {
      white-space: nowrap;
    }

    .pre {
      white-space: pre;
    }

    .prewrap {
      white-space: pre-wrap;
    }

    .preline {
      white-space: pre-line;
    }
  }
}
</style>
