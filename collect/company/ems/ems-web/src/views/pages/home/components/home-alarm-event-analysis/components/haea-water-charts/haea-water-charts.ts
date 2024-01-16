import { defineComponent, onMounted, computed } from 'vue';
import * as echarts from 'echarts/core';
import 'echarts-liquidfill';
export default defineComponent({
  props: ['classificationStatisticsData', 'subscript'],
  setup(props) {
    const borderColorArr = ['#F4160F', '#FFC28C', '#FFE06C', '#6EB3E2'];
    const backgroundColorArr = ['#FeF3F3', '#FFF9F3', '#FFFCF2', '#F5FAFD'];
    // 生成的随机id
    const echartsContainerId = computed(() => {
      return 'charts_' + (Math.random() * 1000).toFixed(0);
    });
    let chart: any;

    const echartsData = computed(() => {
      return props.classificationStatisticsData;
    });
    const darawLine = () => {
      const chartDom = document.getElementById(echartsContainerId.value);
      if (!chartDom) {
        return;
      }
      if (chart) {
        chart?.dispose();
        chart?.clear();
      }
      chart = echarts.init(chartDom);
      const options = {
        series: [
          {
            type: 'liquidFill',
            data: [echartsData.value],
            color: [borderColorArr[props.subscript]], //波浪颜色
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
              borderColor: borderColorArr[props.subscript],
              color: backgroundColorArr[props.subscript], //背景色
            },
            outline: {
              show: false,
              opacity: 0.7,
              borderWidth: 2,
              shadowBlur: 5,
              shadowColor: borderColorArr[props.subscript],
            },
            label: {
              fontSize: 20,
              color: borderColorArr[props.subscript],
            },
            center: ['50%', '50%'],
            radius: '85%',
          },
        ],
      };

      chart && chart.setOption(options);
    };

    onMounted(() => {
      darawLine();
    });

    return {
      echartsContainerId,
    };
  },
});
