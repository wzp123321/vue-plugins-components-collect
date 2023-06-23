<!--
 * @Author: wanzp
 * @Date: 2022-10-31 21:20:45
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-23 15:22:07
 * @Description: 
-->
<template>
  <div id="demo">
    <div class="demo-drag-container">
      <ParentComp></ParentComp>
      <button class="ddc-item" v-repeat-click="test">1234123213</button>
      <button v-testDire v-testDire1></button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { vRepeatClick } from '../directives/directive-repeatClick/index';

import ParentComp from './parent-comp/parent-comp.vue'

const vTestDire= {
  mounted(){
    console.log(111);
  }
}
const vTestDire1= {
  mounted(){
    console.log(222);
  }
}

function test() {
  console.log(11122);
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
