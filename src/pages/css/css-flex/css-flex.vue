<template>
  <div class="css-flex">
    <common-card title="Display-flex属性">
      <p>注意，设为 Flex 布局以后，子元素的float、clear和vertical-align属性将失效</p>
      <div class="cf-flex">
        <div>我是flex</div>
        <div>我是div</div>
        <div>我是flex</div>
      </div>
      <div class="cf-inline-flex">
        <div>我是cf-inline-flex</div>
        <div>我是div</div>
        <div>我是cf-inline-flex</div>
      </div>
    </common-card>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
.css-flex {
  .cf-flex {
    display: flex;
  }

  .cf-inline-flex {
    display: inline-flex;
  }
}
</style>
