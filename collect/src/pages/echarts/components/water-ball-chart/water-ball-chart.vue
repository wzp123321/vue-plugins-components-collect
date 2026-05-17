<template>
  <div class="water-ball-chart" id="water_ball_chart"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { init } from 'echarts';
import 'echarts-liquidfill';

export default defineComponent({
  name: 'WaterBallChart',
  setup() {
    const initChart = () => {
      const chartDom = document.getElementById('water_ball_chart');
      console.log(chartDom);
      if (!chartDom) {
        return;
      }
      const chart = init(chartDom);
      const options = {
        series: [
          {
            type: 'liquidFill',
            data: [0.3],
            color: ['red'],
            itemStyle: {
              opacity: 0.6,
            },
            emphasis: {
              itemStyle: {
                opacity: 0.9,
              },
            },
            backgroundStyle: {
              borderWidth: 2,
              borderColor: 'red',
              color: '#fff',
            },
            outline: {
              show: false,
              opacity: 0.7,
              borderWidth: 2,
              shadowBlur: 5,
              shadowColor: 'red',
            },
            label: {
              fontSize: 20,
              color: 'red',
            },
            center: ['50%', '50%'],
            radius: '85%',
          },
        ],
      };
      chart && chart.setOption(options);
    };
    onMounted(() => {
      initChart();
    });
  },
});
</script>

<style lang="less" scoped>
.water-ball-chart {
  width: 300px;
  height: 240px;

  * {
    width: 100%;
    height: 100%;
  }
}
</style>