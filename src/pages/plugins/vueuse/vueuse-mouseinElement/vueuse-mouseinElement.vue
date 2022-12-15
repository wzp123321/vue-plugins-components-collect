<template>
  <div class="vueuse-mouseinElement" id="vueuse-mouseinElement">
    <h1>-判断鼠标是否在元素范围内</h1>
    <div style="width: 400px; height: 100px; border: 1px solid red" ref="mouseInElementRef">
      不在元素范围内：{{ isOutside }}
      {{ x }}
      {{ y }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useMouseInElement } from '@vueuse/core';

const mouseInElementRef = ref(null);
const { x, y, isOutside } = useMouseInElement(mouseInElementRef);
</script>
<style lang="less" scoped></style>
