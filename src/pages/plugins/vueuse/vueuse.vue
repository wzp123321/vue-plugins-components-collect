<template>
  <div class="vueuse" id="vueuse">
    <button @click="getMousePosition">获取鼠标位置</button>
    <button @click="setPageTitle">设置网页标题</button>
    <button @click="getThrottle">函数防抖</button>
    <button ref="lonePressRef">实现长按</button>
    <button @click="handleLastChange">记录上一次值修改的时间戳</button>

    <div ref="elboundingRef">{{ ElementBoundingInfo }}</div>

    <div ref="dragRef" class="vueuse-drag" :style="style">我在drag{{ x }}, {{ y }}</div>

    <div ref="outsideRef" class="vueuse-outside mt24">outsideRef</div>

    <div class="vueuse-visible" ref="visibleRef">visibleRef------{{ targetIsVisible }}</div>

    <div style="width: 300px; height: 200px; overflow-y: auto">
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <h1>IntersectionObserverTarget</h1>
      <div ref="IntersectionObserverTarget">222222----{{ IntersectionObserverTargetIsVisible }}----{{ stop }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import {
  useMouse,
  useTitle,
  onLongPress,
  onClickOutside,
  useLastChanged,
  useDraggable,
  useElementBounding,
  useElementVisibility,
  useIntersectionObserver,
} from '@vueuse/core';

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
// 获取变量上一次修改的时间戳
const lastValue = ref<string>('');
const last = useLastChanged(lastValue);
const handleLastChange = () => {
  lastValue.value = `${Math.random() * 100000}-------`;
  console.log(last.value, new Date().getTime());
};
// 实现拖拽
const dragRef = ref<HTMLElement | null>(null);
const { x, y, style } = useDraggable(dragRef, {
  initialValue: {
    x: 740,
    y: 140,
  },
});

// 获取html元素的信息 相当于getComputedStyle
const elboundingRef = ref<HTMLElement | null>(null);
const ElementBoundingInfo = useElementBounding(elboundingRef);

// 判断元素是否出现在视口内 同功能的组件：UseElementVisibility
const visibleRef = ref(null);
const targetIsVisible = useElementVisibility(visibleRef, {
  scrollTarget: document.querySelector('.vueuse') as HTMLElement,
});

// 检测目标元素的可见性。
const IntersectionObserverTarget = ref(null);
const IntersectionObserverTargetIsVisible = ref(false);

const { stop } = useIntersectionObserver(IntersectionObserverTarget, ([{ isIntersecting }], observerElement) => {
  IntersectionObserverTargetIsVisible.value = isIntersecting;
});
</script>
<style lang="less" scoped>
.vueuse {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;

  button + button {
    margin-left: 12px;
  }

  &-outside {
    width: 400px;
    height: 200px;

    background-color: red;
  }

  &-drag {
    user-select: none;
    position: fixed;
    padding: 24px;

    border-radius: 8px;
    border: 1px solid var(--color-text-disable);
  }

  &-visible {
    width: 200px;
    height: 200px;
    background-color: rgba(0, 0, 0, 0.08);
  }
}
</style>
