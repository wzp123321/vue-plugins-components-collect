<template>
  <div class="ad-share-rules">
    <h5>分摊规则</h5>

    <div class="adsr-box">
      <ul class="adsr-box-header">
        <li
          v-for="(item, index) in tabOptions"
          :key="'tab_' + index"
          :class="['tab-item', item.value === shareRule.tab ? 'active' : '']"
          @click="shareRule.setTab(item.value)"
        >
          <i v-if="item.value === AD_TABS.分摊规则" class="iconfont icon-a-tubiao23x"></i>
          {{ item.label }}
        </li>
        <span
          class="tab-active"
          :style="{ left: calculateLeft(), width: shareRule.tab === AD_TABS.分摊规则 ? '76px' : '56px' }"
        ></span>
      </ul>
      <component :is="loadComponent(shareRule.tab)" @toBasicIndicator="toBasicIndicator"></component>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onUnmounted } from 'vue';
import { AdShareRuleService } from './ad-share-rules.service';
import { AD_TABS, AD_TAB_KEY } from './ad-share-rules.api';
import { FGetSession } from '@/utils/token';

import AdsrAssociatedScope from './components/adsr-associated-scope/adsr-associated-scope.vue';
import AdsrBasicIndicators from './components/adsr-basic-indicators/adsr-basic-indicators.vue';
import AdsrCaculationIndicators from './components/adsr-calculation-indicators/adsr-calculation-indicators.vue';
import AdsrDetails from './components/adsr-details/adsr-details.vue';

const shareRule = new AdShareRuleService();

const tabOptions = computed(() =>
  Object.entries(AD_TABS)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k, value: Number(v) })),
);

if (!!FGetSession(AD_TAB_KEY)) {
  shareRule.setTab(Number(FGetSession(AD_TAB_KEY)));
} else {
  shareRule.setTab(AD_TABS.分摊规则);
}

function calculateLeft() {
  let left = '20px';
  switch (shareRule.tab) {
    case AD_TABS.分摊规则:
      left = '20px';
      break;
    case AD_TABS.基础指标:
      left = '136px';
      break;
    case AD_TABS.关联范围:
      left = '232px';
      break;
    case AD_TABS.计算指标:
      left = '328px';
      break;
  }
  return left;
}

function loadComponent(tab: number) {
  let component: any;
  switch (tab) {
    case AD_TABS.分摊规则:
      component = AdsrDetails;
      break;
    case AD_TABS.基础指标:
      component = AdsrBasicIndicators;
      break;
    case AD_TABS.关联范围:
      component = AdsrAssociatedScope;
      break;
    case AD_TABS.计算指标:
      component = AdsrCaculationIndicators;
      break;
    default:
      component = AdsrDetails;
      break;
  }
  return component;
}

function toBasicIndicator() {
  shareRule.setTab(AD_TABS.基础指标);
}

onUnmounted(() => {
  window.sessionStorage.removeItem(AD_TAB_KEY);
});
</script>
<style lang="less">
.ad-share-rules {
  width: 100%;
  height: 100%;

  padding: 10px 16px 12px;
  color: var(--color-text-primary);

  display: flex;
  flex-direction: column;

  h5 {
    line-height: 22px;
    font-weight: 400;
    font-size: 16px;
    margin-bottom: 10px;
    color: var(--color-text);
  }

  .adsr-box {
    width: 100%;
    flex: 1 1 auto;

    padding: 15px 12px;

    border-radius: 4px;
    box-shadow: 0px 1px 7px 0px rgba(38, 38, 38, 0.1);
    background-color: var(--color-default);
    box-sizing: border-box;

    display: flex;
    flex-direction: column;

    &-header {
      position: relative;
      width: 100%;
      border-bottom: 1px solid var(--color-text-border);

      li.tab-item {
        position: relative;
        cursor: pointer;
        display: inline-block;
        padding: 8px 0;
        margin: 0 20px;

        line-height: 22px;

        font-size: 14px;
        color: var(--color-text-title);
      }

      li.tab-item.active {
        color: var(--color-primary);
      }

      .tab-active {
        position: absolute;
        bottom: -1px;

        height: 2px;

        background-color: var(--color-primary);

        transition: all 233ms;
      }
    }
  }
}
</style>
