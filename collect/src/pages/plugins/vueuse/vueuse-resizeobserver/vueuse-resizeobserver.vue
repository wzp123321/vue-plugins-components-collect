<template>
  <div class="vueuse-resizeobserver" ref="resizeRef" id="vueuse-resizeobserver">
    <h1>-监听dom元素尺寸变化</h1>
    {{ text }}
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';

const resizeRef = ref(null);
const text = ref('');

useResizeObserver(resizeRef, (entries) => {
  const entry = entries[0];
  const { width, height } = entry.contentRect;
  text.value = `width: ${width}, height: ${height}`;
});
</script>
<style lang="less" scoped>
#vueuse-resizeobserver {
  width: 100%;
  height: 100px;
}
</style>
