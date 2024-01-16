<template>
  <div class="cost-analysis">
    <!-- 搜索栏 -->
    <ca-search-bar></ca-search-bar>
    <!-- 总成本 -->
    <te-row :gutter="24">
      <te-col :span="24" class="ca-progress-col" v-loading="costAnalysisService.barLoading">
        <ca-total-cost v-if="!costAnalysisService.barEmpty && !costAnalysisService.barLoading"></ca-total-cost>
        <!-- 缺省图 -->
        <no-data
          :height="100"
          :marginTop="0"
          v-show="costAnalysisService.barEmpty && !costAnalysisService.barLoading"
        ></no-data>
      </te-col>
    </te-row>
    <!-- 分割线 -->
    <te-divider />
    <te-row :gutter="24">
      <te-col class="ca-chart-col" :span="12">
        <sub-title title="成本占比"></sub-title>
        <div class="ca-chart-container" v-loading="costAnalysisService.pieLoading">
          <!-- 饼图 -->
          <ca-proportion-pie
            v-if="!costAnalysisService.pieEmpty && !costAnalysisService.pieLoading"
          ></ca-proportion-pie>
          <!-- 缺省图 -->
          <no-data v-show="costAnalysisService.pieEmpty && !costAnalysisService.pieLoading"></no-data>
        </div>
      </te-col>
      <te-col class="ca-chart-col" :span="12">
        <sub-title title="成本排名"></sub-title>
        <div class="ca-chart-container" v-loading="costAnalysisService.barLoading">
          <!-- 柱状图 -->
          <ca-rank-bar v-if="!costAnalysisService.barEmpty && !costAnalysisService.barLoading"></ca-rank-bar>
          <!-- 缺省图 -->
          <no-data v-show="costAnalysisService.barEmpty && !costAnalysisService.barLoading"></no-data>
        </div>
      </te-col>
    </te-row>
    <!-- 分割线 -->
    <te-divider />
    <!-- 成本明细  -->
    <te-row :gutter="24">
      <ca-detail-tool-bar></ca-detail-tool-bar>
      <te-col :span="24" v-loading="costAnalysisService.pieLoading">
        <ca-detail-table v-show="!costAnalysisService.pieLoading"></ca-detail-table>
      </te-col>
    </te-row>
  </div>
</template>
<script lang="ts" setup>
import CaSearchBar from './ca-search-bar/ca-search-bar.vue';
import CaTotalCost from './ca-total-cost/ca-total-cost.vue';
import CaProportionPie from './ca-proportion-pie/ca-proportion-pie.vue';
import CaRankBar from './ca-rank-bar/ca-rank-bar.vue';
import CaDetailTable from './ca-detail-table/ca-detail-table.vue';
import CaDetailToolBar from './ca-detail-tool-bar/ca-detail-tool-bar.vue';


import costAnalysisService from './cost-analysis.service';
</script>
<style lang="less" scoped>
.cost-analysis {
  width: 100%;
  height: 100%;

  .te-divider--horizontal {
    margin: 0 0 16px 0;
  }

  .te-row {
    margin: 0 !important;

    > .te-col {
      display: flex;
      flex-direction: column;
      padding: 0 !important;

      .ca-chart-container {
        flex: 1 1 auto;
      }
    }

    .te-col.ca-chart-col {
      min-height: 422px;
    }

    .te-col.ca-progress-col {
      min-height: 136px;
      flex-direction: row;
    }
  }
}
</style>
