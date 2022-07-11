/*
 * @Description: 水球
 * @Author: zpwan
 * @Date: 2022-06-22 17:24:11
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-22 17:32:36
 */
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
            color: ['red'], //波浪颜色
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
              color: '#fff', //背景色
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
