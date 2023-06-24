<!--
 * @Author: wanzp
 * @Date: 2022-10-31 21:20:45
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-24 13:11:37
 * @Description: 
-->
<template>
  <div id="demo">
    <div class="demo-drag-container">
      <!-- <ParentComp></ParentComp> -->

      <input type="text" v-model="testText" v-inputFilter:number />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { vRepeatClick } from '../directives/directive-repeatClick/index';

import ParentComp from './parent-comp/parent-comp.vue';

const testText = ref('');
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
