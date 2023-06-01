<template>
  <div class="bar-charts" id="bar-charts">
    <div class="bc-item"><BcRankChart></BcRankChart></div>
    <div class="bc-item"><MultistageChart></MultistageChart></div>
    <div class="bc-item"><PmChart></PmChart></div>
  </div>
</template>
<script lang="ts" setup>
import BcRankChart from './bc-rank-chart/bc-rank-chart.vue';
import MultistageChart from './bc-multistage-chart/bc-multistage-chart.vue';
import PmChart from './bc-pm-chart/bc-pm-chart.vue';
</script>
<style lang="less" scoped>
#bar-charts {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .bc-item {
    width: calc(50% - 8px);
    height: 400px;
    padding: 16px;
    border: 1px solid var(--color-text-divider);
  }
}
</style>
