<script setup lang="ts">
import { useFileDialog } from '@vueuse/core';

const { files, open, reset } = useFileDialog();
</script>

<template>
  <div class="vueuse-fileDialog" id="vueuse-fileDialog">
    <h1>-选择文件</h1>
    <button @click="open">选择文件</button>
  </div>
</template>
<style lang="less" scoped>
#vueuse-fileDialog {
  width: 100%;
  height: 100px;
}
</style>
