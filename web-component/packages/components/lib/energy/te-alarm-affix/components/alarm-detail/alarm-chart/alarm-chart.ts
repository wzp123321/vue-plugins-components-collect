/* eslint-disable vue/require-valid-default-prop */
/*
 * @Description: 告警曲线
 * @Author: zpwan
 * @Date: 2022-05-26 10:08:25
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-05-26 10:36:54
 */
import { defineComponent, PropType } from 'vue';
import { alarmChart } from '../alarm-detail.function';

export default defineComponent({
  name: 'AlarmChart',
  props: {
    dataSource: {
      type: Object as PropType<alarmChart>,
      default: {},
    },
  },
  setup() {},
});
