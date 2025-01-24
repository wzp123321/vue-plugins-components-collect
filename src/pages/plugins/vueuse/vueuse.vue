<template>
  <div class="vueuse" id="vueuse">
    <MousePosition></MousePosition>
    <LongPress></LongPress>
    <UseImage></UseImage>
    <a-button @click="setPageTitle">设置网页标题</a-button>
    <a-button @click="handleLastChange">记录上一次值修改的时间戳</a-button>

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
    <MouseInElement></MouseInElement>
    <MutationObserver></MutationObserver>
    <ResizeObserver></ResizeObserver>
    <WindowFocus></WindowFocus>
    <WindowScroll></WindowScroll>
    <FileDialog></FileDialog>
    <FullScreen></FullScreen>
    <UseMediaContrlls></UseMediaContrlls>
    <UseDebounceThrottle></UseDebounceThrottle>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import {
  useTitle,
  onClickOutside,
  useLastChanged,
  useDraggable,
  useElementBounding,
  useElementVisibility,
  useIntersectionObserver,
  useUrlSearchParams,
  useDeviceMotion,
  useNow,
  useDateFormat,
  useTimeAgo,
MaybeComputedElementRef,
MaybeElement,
} from '@vueuse/core';

import MousePosition from './vueuse-mouseposition/vueuse-mouseposition.vue';
import LongPress from './vueuse-longpress/vueuse-longpress.vue';
import MouseInElement from './vueuse-mouseinElement/vueuse-mouseinElement.vue';
import MutationObserver from './vueuse-mutationobserver/vueuse-mutationobserver.vue';
import ResizeObserver from './vueuse-resizeobserver/vueuse-resizeobserver.vue';
import WindowFocus from './vueuse-windowfocus/vueuse-windowfocus.vue';
import WindowScroll from './vueuse-windowscroll/vueuse-windowscroll.vue';
import FileDialog from './vueuse-fileDialog/vueuse-fileDialog.vue';
import FullScreen from './vueuse-fullscreen/vueuse-fullscreen.vue';
import UseImage from './vueuse-useimage/vueuse-useimage.vue';
import UseMediaContrlls from './vue-usevmediacontrolls/vue-usevmediacontrolls.vue';
import UseDebounceThrottle from './vue-useDebounce-throttle/vue-useDebounce-throttle.vue';

const { acceleration, accelerationIncludingGravity, rotationRate, interval } = useDeviceMotion();

const outsideRef = ref(null);
const params = useUrlSearchParams('history');

console.log('地址栏参数--------------会丢失特殊字符----', params);
console.log(
  '获取设备位置----------------------------',
  acceleration.value,
  accelerationIncludingGravity.value,
  rotationRate.value,
  interval.value,
);
console.log('格式化当前时间---------', useDateFormat(useNow(), 'YYYY-MM-DD HH:mm:ss').value);
console.log('距离当前时间差---------', useTimeAgo(new Date(2021, 0, 1)).value);
function setPageTitle() {
  useTitle(`title_${(Math.random() * 10000).toFixed(0)}`);
}

// 点击区域外部(会触发当前回调)
onClickOutside(
  outsideRef,
  (e: Event) => {
    console.log('点击区域外部', e);
  },
  {
    ignore: [],
    capture: false,
    detectIframe: false,
  },
);

// 获取变量上一次修改的时间戳
const lastValue = ref<{ name: string }>({ name: '' });
const last = useLastChanged(lastValue);
const handleLastChange = () => {
  lastValue.value.name = `${Math.random() * 100000}-------`;
  console.log(last.value, new Date().getTime());
};
// 实现拖拽
const dragRef = ref<HTMLElement | null>(null);
const { x, y, style } = useDraggable(dragRef as any, {
  initialValue: {
    x: 740,
    y: 140,
  },
});

// 获取html元素的信息 相当于getComputedStyle
const elboundingRef = ref<HTMLElement | null>(null);
const ElementBoundingInfo = useElementBounding(elboundingRef as MaybeComputedElementRef<MaybeElement>);

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
  console.log(observerElement);
});

// let count = ref<number>(0);
// const MAX_COUNT = 100;
// let timer: any;
// function loadProgress() {
//   timer = setInterval(() => {
//     const pro = Number((Math.random() * 4).toFixed(0));
//     count.value += pro > MAX_COUNT - count.value ? MAX_COUNT - count.value : pro;
//     if (MAX_COUNT <= count.value) {
//       clearInterval(timer);
//     }
//   }, 1000);
// }

// loadProgress();
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
    cursor: move;
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
