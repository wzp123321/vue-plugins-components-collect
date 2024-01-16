/*
 * @Description: 能源事件
 * @Autor: zpwan
 * @Date: 2022-04-21 17:19:35
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-28 09:27:05
 */
import { defineComponent, onMounted } from 'vue';

import energyEventService from './services/th-ee-service';
import { TH_FOpenTag } from '../services/services';

import { VALUE_STATUS } from './constant/index';

export default defineComponent({
  name: 'ThEnergyEvent',
  setup() {
    onMounted(() => {
      energyEventService.query();
    });

    // 跳转
    const pageToEvent = () => {
      TH_FOpenTag(energyEventService.url);
    };

    return {
      energyEventService,
      VALUE_STATUS,
      pageToEvent,
    };
  },
});
