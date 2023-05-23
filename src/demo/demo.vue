<!--
 * @Author: wanzp
 * @Date: 2022-10-31 21:20:45
 * @LastEditors: wanzp
 * @LastEditTime: 2023-05-20 16:46:27
 * @Description: 
-->
<template>
  <div id="demo">
    <div class="demo-drag-container">
      <div class="ddc-item"></div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
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
