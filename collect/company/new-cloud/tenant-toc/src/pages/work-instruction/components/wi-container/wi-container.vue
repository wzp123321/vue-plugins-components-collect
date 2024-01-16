<!--
 * @Author: yut
 * @Date: 2023-08-09 11:16:07
 * @LastEditors: yut
 * @LastEditTime: 2023-08-09 14:16:40
 * @Descripttion: 
-->
<template>
  <div class="wi-container">
    <h5>{{ title }}</h5>
    <div class="wi-container-content">
      <slot name="wiContent"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  title: string; //标题
}>();
</script>
<style lang="less" scoped>
.wi-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: var(--te-space-16);
  > h5 {
    font-size: var(--te-font-size-h16);
    color: var(--te-text-color-primary);
    height: 24px;
    line-height: 24px;
    flex: none;
  }
  &-content {
    flex: auto;
    display: flex;
  }
}
</style>
