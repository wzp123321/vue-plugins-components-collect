<template>
  <div class="chart-province">
    <div class="cm-container-province" :id="chartMapService.customChartId"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import ChartMapService from './chart-province.service';

export default defineComponent({
  name: 'ChartMap',
  setup() {
    const chartMapService = new ChartMapService();

    onMounted(() => {
      chartMapService.initCharts();
    });

    return {
      chartMapService,
    };
  },
});
</script>

<style lang="less" scoped>
.chart-province {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .cm-container-province {
    width: 1120px;
    height: 880px;

    * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>