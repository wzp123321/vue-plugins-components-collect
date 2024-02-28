import { defineComponent, onMounted, onUnmounted } from 'vue';
import CmBar from './components/cm-bar.vue';
import CmLine from './components/cm-line.vue';
import CmWater from './components/cm-water.vue';
import CmGauge from './components/cm-gauge.vue';
import ChartMapService from './chart-map.service';

export default defineComponent({
  name: 'ChartMap',
  components: {
    CmBar,
    CmLine,
    CmWater,
    CmGauge,
  },
  setup() {
    const chartMapService = new ChartMapService();

    const startAnimation = () => {
      chartMapService.initCharts();
    };

    onMounted(() => {
      startAnimation();

      window.addEventListener('resize', () => {
        chartMapService.resize();
      });
    });
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        chartMapService.resize();
      });
    });

    return {
      chartMapService,
      startAnimation,
    };
  },
});
