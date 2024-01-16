/*
 * @Description: 圆环图
 * @Autor: zpwan
 * @Date: 2022-04-26 09:17:06
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-27 14:03:27
 */
import { defineComponent, PropType, computed } from 'vue';

import ThAtCharts from '../th-at-charts/th-at-charts.vue';

import { AlarmTrackInfo } from '../services/th-at-api';

export default defineComponent({
  name: 'ThAtCard',
  components: {
    'th-at-charts': ThAtCharts,
  },
  props: {
    alarmTrackVO: {
      type: Object as PropType<AlarmTrackInfo>,
      default: {},
    },
  },
  setup(props) {
    const alarmTrackVO = computed(() => {
      return props.alarmTrackVO;
    });

    return {
      alarmTrackVO,
    };
  },
});
