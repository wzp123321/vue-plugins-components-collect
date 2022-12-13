<template>
  <div class="vueuse" id="vueuse">
    <button @click="getMousePosition">获取鼠标位置</button>
    <button @click="setPageTitle">设置网页标题</button>
    <button @click="getThrottle">函数防抖</button>
    <button ref="lonePressRef">实现长按</button>

    <div ref="outsideRef" class="vueuse-outside">123123123</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useMouse, useTitle, onLongPress, onClickOutside } from '@vueuse/core';

const outsideRef = ref(null);
const lonePressRef = ref(null);
const mouse = useMouse();

function getMousePosition() {
  console.log('mouseX--------------------', mouse.x.value);
  console.log('mouseY--------------------', mouse.y.value);
  console.log('mousesourceType--------------------', mouse.sourceType.value);
}
function setPageTitle() {
  useTitle(`title_${(Math.random() * 10000).toFixed(0)}`);
}
function getThrottle() {
  // const throttle = throttleFilter(500);
  // throttle(() => {
  //   console.log(1231312312);
  // }, 400);
}
// 点击区域外部(会触发当前回调)
onClickOutside(
  outsideRef,
  (e: Event) => {
    console.log('点击区域外部', e);
  },
  {},
);
// 实现长按dom
onLongPress(
  lonePressRef,
  (e: Event) => {
    console.log('long-presss', e);
  },
  {
    delay: 4000,
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
.vueuse {
  width: 100%;
  height: 100%;

  &-outside {
    width: 400px;
    height: 200px;

    background-color: red;
  }
}
</style>
