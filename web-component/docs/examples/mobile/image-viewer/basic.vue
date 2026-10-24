<template>
  <tem-cell titleText="预览图片" layout="vertical" showContent>
    <template #content>
      <tem-image-viewer type="image" :urls="imageUrls"></tem-image-viewer>
    </template>
  </tem-cell>
  <tem-cell titleText="预览视频" layout="vertical" showContent>
    <template #content>
      <tem-image-viewer type="video" :urls="videoUrls"></tem-image-viewer>
    </template>
  </tem-cell>
</template>

<script lang="ts" setup>
// import { TemCell, TemImageViewer } from '@zpackage/mobile-package';
const imageUrls = [
  'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
  'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
];
const videoUrls = ['http://www.w3school.com.cn/i/movie.mp4'];
</script>

<style lang="scss"></style>
