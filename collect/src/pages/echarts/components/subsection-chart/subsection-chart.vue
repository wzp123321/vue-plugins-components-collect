<template>
  <div class="subsection-chart">
    <div class="charts-container" :id="alarmChart.customChartId"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import AlarmChartService from './subsection-chart-service';

export default defineComponent({
  name: 'AlarmChart',
  props: {
    dataSource: {
      type: Object,
    },
  },
  setup(props) {
    const alarmChart = new AlarmChartService(props.dataSource);

    onMounted(() => {
      alarmChart.initChart();
    });

    return {
      alarmChart,
    };
  },
});
</script>

<style lang="less" scoped>
.subsection-chart {
  width: 100%;
  height: 100%;

  .charts-container {
    width: 100%;
    height: 100%;
  }
}
</style>