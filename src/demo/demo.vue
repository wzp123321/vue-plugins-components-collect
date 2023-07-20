<!--
 * @Author: wanzp
 * @Date: 2022-10-31 09:22:34
 * @LastEditors: wanzp
 * @LastEditTime: 2023-07-04 14:05:43
 * @Description: Description
-->
<template>
  <div id="demo">
    <div class="demo-drag-container">
      <svg>
        <use xlink:href="#icon-shangsheng"></use>
      </svg>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { vRepeatClick } from '../directives/directive-repeatClick/index';
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
