<!--
 * @Author: wanzp
 * @Date: 2022-10-31 21:20:45
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-04 20:28:33
 * @Description: 
-->
<template>
  <div id="demo">
    <div class="demo-drag-container">
      <button class="ddc-item" v-repeat-click="test">1234123213</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { vRepeatClick } from '../directives/directive-repeatClick/index';

function test() {
  console.log(111);
}
</script>
<style lang="less" scoped>
.demo {
  width: 100%;
  height: 100%;

  .demo-drag-container {
    width: 90%;
    height: 90%;
    margin: 5% 5%;

    border: 1px dashed var(--color-text-divider);
    border-radius: 4px;

    .ddc-item {
      width: 360px;
      height: 360px;
      border: 1px solid var(--color-text-divider);
    }
  }
}
</style>
