<template>
  <div class="animation-light-switch">
    <section class="als-left">
      <header>
        <span
          v-for="(item, index) in lightList"
          :key="item.activeColor"
          :class="['als-light-item', currentIndex === index ? 'active' : '', remainingTime <= 3 ? 'blinking' : '']"
          :style="{ backgroundColor: currentIndex === index ? item.activeColor : inactiveColor }"
        ></span>
      </header>
      <p>剩余时间：{{ remainingTime }}秒</p>
      <section class="als-footer">
        <a-button @click="handlePauseSwitch">{{ pauseFlag ? '开始' : '暂停' }}</a-button>
      </section>
    </section>
    <section class="als-right">
      <div class="als-configure-item">
        <span>红灯时长</span>
        <a-input :value="lightList[0].duration" @blur="handleBlur($event, 0)"></a-input>
      </div>
      <div class="als-configure-item">
        <span>绿灯时长</span>
        <a-input :value="lightList[1].duration" @blur="handleBlur($event, 1)"></a-input>
      </div>
      <div class="als-configure-item">
        <span>黄灯时长</span>
        <a-input :value="lightList[2].duration" @blur="handleBlur($event, 2)"></a-input>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { lightList, inactiveColor } from './model';
import { cloneDeep } from 'lodash';

defineOptions({
  name: 'AnimationLightSwitch',
});
// 当前灯
const currentIndex = ref(0);
// 剩余时间
const remainingTime = ref(0);
// 定时器实例
let intervalId: any;
// 是否暂停
const pauseFlag = ref(false);
const changeLight = (index: number) => {
  const lightItem = lightList[index];
  if (remainingTime.value === 0) {
    remainingTime.value = cloneDeep(lightItem.duration);
  }
  // 如果有定时器，需要先清空定时器
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    remainingTime.value -= 1;
    if (remainingTime.value === 0) {
      currentIndex.value = (index + 1) % lightList.length;
      changeLight(currentIndex.value);
    }
  }, 1000);
};
/**
 * 暂停启动
 */
const handlePauseSwitch = () => {
  pauseFlag.value = !pauseFlag.value;
  if (pauseFlag.value) {
    clearInterval(intervalId);
  } else {
    changeLight(currentIndex.value);
  }
};
/**
 * 修改时长
 * @param {Event} event
 * @param {number} index
 */
const handleBlur = (event: Event, index: number) => {
  if (event.target && event.target instanceof HTMLInputElement) {
    const value = Number(event.target?.value);
    if (value > 0) {
      lightList[index].duration = value;
      changeLight(currentIndex.value);
    }
  }
};
onMounted(() => {
  changeLight(currentIndex.value);
});
</script>
<style lang="less" scoped>
.animation-light-switch {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;

  > .als-left,
  > .als-right {
    flex: auto;
    flex-shrink: 0;
    height: 100%;
  }

  .als-left > header {
    display: flex;
    align-items: center;
    gap: 16px;

    > span {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    > span.active.blinking {
      animation: blink 1s infinite;
    }
  }

  > .als-right {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;

    .als-configure-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.1;
  }
}
</style>
