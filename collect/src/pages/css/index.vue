<template>
  <div class="css common-container">
    <div class="cc-item h360">
      <CssFlex></CssFlex>
    </div>
    <div class="cc-item h360">
      <CssMove></CssMove>
    </div>
    <div class="cc-item h360 ttt">
      <CssImageScale></CssImageScale>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CssFlex from './components/css-dice/css-dice.vue';
import CssMove from './components/css-move/css-move.vue';
import CssImageScale from './components/css-image-scale/css-image-scale.vue';
</script>
<style lang="less" scoped>
.css {
  width: 100%;
  height: 100%;
  .ttt {
    align-items: center;
    background-image: linear-gradient(90deg, #04182c, #000c17, #04182c);
    display: flex;
    flex-direction: column;
    height: 360px;
    justify-content: center;
    width: 100%;

    p {
      font-size: 24px;
      color: #fff;
    }
  }
}
</style>
