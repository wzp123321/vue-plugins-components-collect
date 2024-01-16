<template>
  <ul class="ea-switch-tab" id="ea-switch-tab">
    <img
      v-if="switchTab.tabOptions?.length === 1"
      src="../../../../../assets/img/energy-anomaly/ea-tab-one-0.png"
      alt=""
    />

    <img
      v-if="switchTab.tabOptions?.length === 2 && switchTab.activeIndex === 0"
      src="../../../../../assets/img/energy-anomaly/ea-tab-two-0.png"
      alt=""
    />
    <img
      v-if="switchTab.tabOptions?.length === 2 && switchTab.activeIndex === 1"
      src="../../../../../assets/img/energy-anomaly/ea-tab-two-1.png"
      alt=""
    />

    <img
      v-if="switchTab.tabOptions?.length === 3 && switchTab.activeIndex === 0"
      src="../../../../../assets/img/energy-anomaly/ea-tab-three-0.png"
      alt=""
    />
    <img
      v-if="switchTab.tabOptions?.length === 3 && switchTab.activeIndex === 1"
      src="../../../../../assets/img/energy-anomaly/ea-tab-three-1.png"
      alt=""
    />
    <img
      v-if="switchTab.tabOptions?.length === 3 && switchTab.activeIndex === 2"
      src="../../../../../assets/img/energy-anomaly/ea-tab-three-2.png"
      alt=""
    />
    <li
      v-for="(item, index) in switchTab.tabOptions"
      :key="'tab_' + index"
      @click="switchTab.setTab(item.value, index)"
      :class="{ active: item.value === switchTab.currentTab }"
    >
      <div class="anomaly-title">
        <span v-for="childItem in item.label"> {{ childItem }}</span>
      </div>
      <span class="anomaly-count">{{ mapTabCount(item.value) }}</span>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { computed, PropType } from 'vue';

import switchTab from './ea-switch-tab.service';
import { EA_ST_TABS, EA_ITabAnomalyNum } from './ea-switch-tab.api';

const props = defineProps({
  tabAnomalyCount: {
    type: Object as PropType<EA_ITabAnomalyNum>,
    default: {
      actualTimeAlarmNumber: 0,
      boundaryAlarmNumber: 0,
      yesterdayAlarmNumber: 0,
    },
  },
});

switchTab.mapAuthorityTab();

const mapTabCount = (value: string) => {
  let count = '0';
  switch (value) {
    case EA_ST_TABS.实时异常:
      count =
        props.tabAnomalyCount?.actualTimeAlarmNumber > 99
          ? '99+'
          : String(props.tabAnomalyCount?.actualTimeAlarmNumber);
      break;
    case EA_ST_TABS.昨日异常:
      count =
        props.tabAnomalyCount?.yesterdayAlarmNumber > 99 ? '99+' : String(props.tabAnomalyCount?.yesterdayAlarmNumber);
      break;
    case EA_ST_TABS.边界异常:
      count =
        props.tabAnomalyCount?.boundaryAlarmNumber > 99 ? '99+' : String(props.tabAnomalyCount?.boundaryAlarmNumber);
      break;
  }
  return count;
};
</script>
<style lang="less" scoped>
#ea-switch-tab {
  position: relative;
  cursor: pointer;
  width: 60px;
  background-color: var(--iot-bg-color-container);

  display: flex;
  flex-direction: column;

  background-repeat: no-repeat;
  background-position: top;
  background-size: contain;

  transition: none;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
  }

  li {
    position: relative;
    display: inline-block;
    text-align: center;

    width: 47px;
    height: 148px;

    font-size: 14px;
    z-index: 2;

    div.anomaly-title {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);

      width: 23px;
      height: 80px;
      min-height: 80px;

      > span {
        display: block;
        line-height: 22px;
      }
    }

    span.anomaly-count {
      position: absolute;
      top: 114px;
      left: 50%;
      transform: translateX(-50%);

      display: inline-block;

      height: 22px;
      line-height: 22px;
      width: 32px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.08);
      color: var(--color-text-secondary);
    }

    &.active {
      div.anomaly-title > span {
        color: rgba(24, 144, 255, 1);
        font-size: 14px;
        font-weight: 600;
      }

      > span.anomaly-count {
        background-color: rgba(230, 247, 255, 1);
        color: rgba(24, 144, 255, 1);
      }
    }

    &:last-child {
      height: 156px;
    }
  }
}
</style>
