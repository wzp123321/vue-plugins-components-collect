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
    <h1>默认grid-template-areas</h1>
      <div class="cp-grid-template-areas-1">
        <div v-for="item in 9" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1>多个单元格合并成一个区域的写法如下</h1>
      <div class="cp-grid-template-areas-2">
        <div v-for="item in 3" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1>顶部是页眉区域header，底部是页脚区域footer，中间部分则为main和sidebar。      </h1>
      <div class="cp-grid-template-areas-3">
        <div v-for="item in 4" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
      <h1> 如果某些区域不需要利用，则使用"点"（.）表示。</h1>
      <div class="cp-grid-template-areas-4">
        <div v-for="item in 6" :style="{ backgroundColor: mapColor(item) }" class="item">{{ item }}</div>
      </div>
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

  .cp-grid-template-areas-1{
    display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas: 'a b c'
                       'd e f'
                       'g h i';
  }

  .cp-grid-template-areas-2{
    display: grid;
  grid-template-columns: 150px 100px 300px;
  grid-template-rows: auto;
  grid-template-areas: 'a a a'
                     'b b b'
                     'c c c';    
                     
                     .item:nth-child(1){
                      grid-area: a;
                     }

                     .item:nth-child(2)
                     {
                      grid-area: b;
                     }

                     .item:nth-child(3){
                      grid-area: c;
                     }
  }

  .cp-grid-template-areas-3{
    display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas: "header header header"
                     "main main sidebar"
                     "footer footer footer";

                     .item:nth-child(1){
                      grid-area: header;
                     }

                     .item:nth-child(2)
                     {
                      grid-area: main;
                     }

                     .item:nth-child(3){
                      grid-area: sidebar;
                     }

                     .item:nth-child(4){
                      grid-area: footer;
                     }
  }

  .cp-grid-template-areas-4{
    display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas: 'a . c'
                     'd . f'
                     'g . i';

                     .item:nth-child(1){
                      grid-area: a;
                     }

                     .item:nth-child(2)
                     {
                      grid-area: c;
                     }

                     .item:nth-child(3){
                      grid-area: d;
                     }

                     .item:nth-child(4){
                      grid-area: f;
                     }
                     .item:nth-child(5){
                      grid-area: g;
                     }

                     .item:nth-child(6){
                      grid-area: i;
                     }
  }
}
</style>
