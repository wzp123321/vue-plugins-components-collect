/*
 * @Description: 能源概览
 * @Autor: zpwan
 * @Date: 2022-04-21 15:23:18
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-28 09:27:13
 */
import { defineComponent, onMounted } from 'vue';

import energySurveyService from './services/th-energy-survey.service';
import { TH_FOpenTag } from '../services/services';

import SurveyItem from './th-es-survey-item/th-es-survey-item.vue';

export default defineComponent({
  name: 'ThEnergySurvey',
  components: {
    'th-es-survey-item': SurveyItem,
  },
  setup() {
    onMounted(() => {
      energySurveyService.query();
    });

    //跳转
    const pageToAnalysis = (): void => {
      TH_FOpenTag(energySurveyService.url);
    };
    return {
      energySurveyService,
      pageToAnalysis,
    };
  },
});
