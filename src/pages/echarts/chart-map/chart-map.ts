/*
 * @Description: echarts-地球
 * @Author: zpwan
 * @Date: 2022-06-06 16:26:53
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-06-06 16:47:36
 */
import { defineComponent, onMounted } from 'vue';

import ChartMapService from './chart-map.service';

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
