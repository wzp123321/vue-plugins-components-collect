<template>
  <div class="vueuse-windowfocus" id="vueuse-windowfocus" ref="windowFocusRef">
    <h1>-window是否聚焦</h1>
    {{ focused }}
  </div>
</template>
<script lang="ts" setup>
import { useWindowFocus } from '@vueuse/core';

const focused = useWindowFocus();
</script>
<style lang="less" scoped>
#vueuse-windowfocus {
  width: 100%;
  height: 100px;
}
</style>
