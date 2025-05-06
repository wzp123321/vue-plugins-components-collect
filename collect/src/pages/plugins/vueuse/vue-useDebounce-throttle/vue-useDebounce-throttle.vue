<template>
  <div class="vue-useDebounce-throttle" id="vue-useDebounce-throttle">
    <a-button @click="handleDebounce">debounce函数</a-button>
    <a-button @click="handleThrottle">throttle函数</a-button>
  </div>
</template>
<script lang="ts" setup>
import { useDebounceFn, useThrottleFn } from '@vueuse/core';

const handleDebounce = useDebounceFn(() => {
  console.log('debounce函数------------------');
}, 500);

const handleThrottle = useThrottleFn(() => {
  console.log('throttle函数------------------');
}, 500);
</script>
<style lang="less" scoped>
#vue-useDebounce-throttle {
  width: 100%;
  height: 200px;

  margin-top: 120px;
}
</style>
