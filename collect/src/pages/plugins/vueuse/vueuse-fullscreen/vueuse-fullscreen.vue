<script setup lang="ts">
import { ref } from 'vue';
import { useFullscreen } from '@vueuse/core';
const iframeRef = ref(null);
const { isFullscreen, isSupported, exit, toggle } = useFullscreen(iframeRef, {
  autoExit: true,
});
</script>

<template>
  <div id="vueuse-fullscreen" class="vueuse-fullscreen">
    <el-button @click="toggle">FullScreen</el-button>
    <el-button @click="exit">取消全屏</el-button>
    <p>是否全屏----{{ isFullscreen }}</p>
    <p>是否支持全屏----{{ isSupported }}</p>
    <iframe src="https://www.bilibili.com/" ref="iframeRef" frameborder="0"></iframe>
  </div>
</template>
<style lang="less" scoped>
#vueuse-fullscreen {
  width: 100%;
  height: 100px;
}
</style>
