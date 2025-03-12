<template>
  <div class="echarts">
    <h5>ECharts图表</h5>
    <a-row :gutter="20">
      <a-col :span="12">
        <a-card class="box-card">
          <h5>南丁格尔玫瑰图</h5>
          <NightingaleCharts></NightingaleCharts>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h5>折线区域图</h5>
          <LcAreaChart></LcAreaChart>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h5>折线断点图</h5>
          <LcBreakPointChart></LcBreakPointChart>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card class="box-card">
          <h5>折线图</h5>
          <LcSubsectionChart></LcSubsectionChart>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { NightingaleCharts, LcAreaChart, LcBreakPointChart, LcSubsectionChart } from './components';

defineOptions({
  name: 'ComponentsLittle',
});
</script>
<style lang="less" scoped>
.echarts {
  width: 100%;
  height: 100%;

  :deep(.ant-col) {
    padding-top: 10px;
    padding-bottom: 10px;

    .ant-card,
    .ant-card-body {
      height: 360px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}
</style>
