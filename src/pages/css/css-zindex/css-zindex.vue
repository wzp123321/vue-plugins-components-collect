<!--
 * @Author: wanzp
 * @Date: 2023-02-23 21:44:39
 * @LastEditors: wanzp
 * @LastEditTime: 2023-02-23 21:59:30
 * @Description: 
-->
<template>
  <div class="css-zindex">
    <div class="css-zindex-module1">
      <div class="first">1-1</div>
      <div class="second">1-2</div>
    </div>
    <div class="css-zindex-module2">
      <div class="first">2-1</div>
      <div class="second">2-2</div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.css-zindex {
  width: 100%;
  height: 100%;
  overflow-y: auto;

  .css-zindex-module1,
  .css-zindex-module2 {
    border: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
    width: 100%;
    height: 200px;
    position: relative;

    .first,
    .second {
      position: absolute;
      left: 100px;

      width: 200px;
      height: 200px;
    }
  }

  .css-zindex-module1 {
    z-index: 11;
    .first {
      left: 20px;
      top: 50px;
      background-color: red;
    }
    .second {
      top: 150px;
      left: 70px;
      background-color: blue;
    }
  }

  .css-zindex-module2 {
    z-index: 10;
    .first {
      left: 30px;
      top: 50px;
      background-color: yellow;
      z-index: 12;
    }
    .second {
      left: 20px;
      top: 70px;
      background-color: green;
      z-index: 13;
    }
  }
}
</style>
