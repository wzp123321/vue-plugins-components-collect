/*
 * @Description: 告警曲线
 * @Author: zpwan
 * @Date: 2022-05-26 10:08:25
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-05-26 10:36:54
 */
import { defineComponent, onMounted } from 'vue';

import AlarmChartService from './alarm-chart-service';

export default defineComponent({
  name: 'AlarmChart',
  props: {
    dataSource: {
      type: Object,
      default: {},
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
