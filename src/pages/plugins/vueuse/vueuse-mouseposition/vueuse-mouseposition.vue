<template>
  <div class="vueuse-mouseposition" id="vueuse-mouseposition">
    <h1>-获取鼠标实时位置</h1>
    <p>x---------------{{ mouse.x }}</p>
    <p>y---------------{{ mouse.y }}</p>
  </div>
</template>
<script lang="ts" setup>
import { useMouse, throttleFilter } from '@vueuse/core';

const mouse = useMouse({ eventFilter: throttleFilter(300) });
</script>
<style lang="less" scoped>
#vueuse-mouseposition {
  width: 100%;
  height: 100px;
}
</style>
