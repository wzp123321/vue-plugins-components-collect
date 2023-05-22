<template>
  <div class="line-charts" id="line-charts">
    <div class="lc-item"><LcBreakPointChart></LcBreakPointChart></div>
    <div class="lc-item"><LcSubsectionChart></LcSubsectionChart></div>
    <div class="lc-item"><LcAreaChart></LcAreaChart></div>
  </div>
</template>
<script lang="ts" setup>
import LcBreakPointChart from './lc-breakpoint-chart/lc-breakpoint-chart.vue';
import LcSubsectionChart from './lc-subsection-chart/lc-subsection-chart.vue';
import LcAreaChart from './lc-area-chart/lc-area-chart.vue';
</script>
<style lang="less" scoped>
#line-charts {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .lc-item {
    width: calc(50% - 8px);
    height: 400px;
    padding: 16px;
    border: 1px solid var(--color-text-divider);
  }
}
</style>
