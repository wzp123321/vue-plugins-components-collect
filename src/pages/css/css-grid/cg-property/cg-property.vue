<template>
  <div class="cg-property">
    <common-card title="Display-grid属性">
      <CpDisplay></CpDisplay>
    </common-card>
    <common-card title="grid-template-columns 属性和 grid-template-rows 属性">
    <h1>grid-template-columns 属性和 grid-template-rows 属性</h1>
      <div class="cp-grid-template">
      <div v-for="item in 9" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1>repeat</h1>
      <div class="cp-grid-repeat">
      <div v-for="item in 9" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1>repeat某种特定的组合</h1>
      <div class="cp-grid-repeat-custom">
      <div v-for="item in 9" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1>fr</h1>
      <div class="cp-grid-fr">
      <div v-for="item in 6" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
    </common-card>
    <common-card title="auto-fill 关键字">
      <CgAutoFill></CgAutoFill>
    </common-card>
    <common-card title="grid-template-areas">
      <div class="cp-grid-template-areas"></div>
    </common-card>
    
  </div>
</template>
<script lang="ts" setup>
import CpDisplay from './cp-display.vue';
import CgAutoFill from './cg-auto-fill.vue';

import { mapColor } from '../../../../utils';
</script>
<style lang="less" scoped> 
.cg-property {
  width: 100%;
  height: 100%;

  .cp-grid-template{
    display: grid;
    grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  }

  .cp-grid-repeat{
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
  }

  .cp-grid-repeat-custom{
    display: grid;
    grid-template-columns: repeat(1, 100px 200px 50px);
    grid-template-rows: repeat(1, 100px 180px 240px);
  }

  .cp-grid-fr{
    display: grid;
    grid-template-columns: 100px 1fr 2fr 3fr 2fr 1fr;
    grid-template-rows: repeat(1, 100px);
  }
}
</style>
