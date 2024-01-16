/*
 * @Description:告警追踪
 * @Autor: zpwan
 * @Date: 2022-04-25 19:14:12
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-07 14:04:09
 */
import { defineComponent, onMounted } from 'vue';

import alarmTrackService from './services/th-at-service';
import { TH_FOpenTag } from '../services/services';

import ThAtCard from './th-at-card/th-at-card.vue';

export default defineComponent({
  name: 'ThAlarmTrack',
  components: {
    'th-at-card': ThAtCard,
  },
  setup() {
    onMounted(() => {
      alarmTrackService.query();
    });

    // 页面跳转
    const pageToAlarm = (): void => {
      TH_FOpenTag(alarmTrackService.url);
    };
    return {
      alarmTrackService,
      pageToAlarm,
    };
  },
});
