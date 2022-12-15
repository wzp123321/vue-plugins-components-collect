<template>
  <div class="vueuse-windowscroll" id="vueuse-windowscroll">
    <h1>--获取window滚动的信息{{ x }}{{ y }}</h1>
    <h1>--获取window信息{{ width }}{{ height }}</h1>
  </div>
</template>
<script lang="ts" setup>
import { useWindowScroll, useWindowSize } from '@vueuse/core';

const { x, y } = useWindowScroll();
const { width, height } = useWindowSize();
</script>
<style lang="less" scoped>
#vueuse-windowscroll {
  width: 100%;
  height: 100px;
}
</style>
