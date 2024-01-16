/*
 * @Description: 概览item
 * @Autor: zpwan
 * @Date: 2022-04-21 17:06:13
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-27 11:42:46
 */
import { defineComponent, PropType, computed } from 'vue';
import { EnergySurveyInfo } from '../services/th-energy-survey.api';

import { VALUE_STATUS } from '../../th-energy-event/constant/index';

export default defineComponent({
  name: 'ThEsSurveyItem',
  props: {
    surveyValue: {
      type: Object as PropType<EnergySurveyInfo>,
      default: {},
    },
  },
  setup(props) {
    const surveyValue = computed(() => {
      return props.surveyValue;
    });

    return {
      VALUE_STATUS,
      surveyValue,
    };
  },
});
