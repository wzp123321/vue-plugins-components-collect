<template>
  <div class="vueuse-longpress" id="vueuse-longpress">
    <h1>-实现鼠标长按</h1>
    <a-button ref="lonePressRef">实现长按</a-button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { onLongPress } from '@vueuse/core';

const lonePressRef = ref(null);

onLongPress(
  lonePressRef,
  (e: Event) => {
    console.log('long-presss', e);
  },
  {
    delay: 3000,
    modifiers: {
      stop: true,
      once: true,
      prevent: true,
      capture: true,
      self: true,
    },
  },
);
</script>
<style lang="less" scoped>
#vueuse-longpress {
  width: 100%;
  height: 100px;
}
</style>
