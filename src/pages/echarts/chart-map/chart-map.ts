import { defineComponent, onMounted } from 'vue';
import ChartMapService from './chart-map.service';

export default defineComponent({
  name: 'ChartMap',
  setup() {
    const chartMapService = new ChartMapService();

    const startAnimation = () => {
      chartMapService.initCharts();
    };

    onMounted(() => {
      startAnimation();
    });

    return {
      chartMapService,
      startAnimation,
    };
  },
});
