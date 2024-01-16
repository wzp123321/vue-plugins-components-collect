/*
 * @Description: 能源事件库详情弹框
 * @Autor: kongx
 * @Date: 2022-05-12 10:53:11
 * @LastEditors: kongx
 * @LastEditTime: 2022-05-18 11:08:13
 */
import { defineComponent, PropType } from 'vue';
import { DetailForm } from '../../constant/options';
export default defineComponent({
  name: 'EnergyEventDetailDialog',
  props: {
    eventDetailObj: {
      type: Object as PropType<DetailForm>,
    },
  },
  setup() {
    return {};
  },
});
