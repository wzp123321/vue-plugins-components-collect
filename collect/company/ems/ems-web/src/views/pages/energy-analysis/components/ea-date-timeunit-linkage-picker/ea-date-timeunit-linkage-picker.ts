/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *            佛祖保佑               永无BUG
 */
import { defineComponent, toRefs, PropType, computed, reactive, watch, ref, onMounted, nextTick } from 'vue';
// config
import { Common_EQuickTimingType, TIME_UNITS } from '@/config/enum';

import { subDays, startOfMonth, startOfISOWeek } from 'date-fns';

import {
  mapQuickTimingTypeByDateScope,
  mapQuickTimingTypeListByTimeUnit,
  mapDateScopeByQuickTimingType,
  mapDefaultQuickTimingTypeListByTimeUnit,
} from '../../utils';
import { Common_IValueLabel } from '@/services/common/common-api';
import { cloneDeep } from 'lodash';
import { formatDate } from '@/utils';

interface PickerState {
  dateForm: {
    dateScope: string;
    timeUnit: string;
    date: Date[];
  };
  message: string;
}

export default defineComponent({
  name: 'DateTimeunitLinkagePicker',
  props: {
    // 时间颗粒度数组
    timeUnitList: {
      type: Array as PropType<GlobalModule.DictionaryInfo[]>,
      default: [],
    },
    // 时间颗粒度
    timeUnit: {
      type: String,
      default: '',
    },
    // 是否展示时间颗粒度下拉框
    isShowTimeUnit: {
      type: Boolean,
      default: true,
    },
    // 选中时间范围
    value: {
      type: Array as PropType<Date[]>,
      default: [],
    },
    // 是否展示快捷选时
    showDateScope: {
      type: Boolean,
      default: true,
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true,
    },
    // 服务器时间
    serverDate: {
      type: Date,
      default: new Date(),
    },
    // 日期禁用
    disableDateCb: {},
    // 是否使用新快捷选时
    isNewQuickTiming: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value', 'update:timeUnit', 'change'],
  setup(props, { emit }) {
    //   时间颗粒度数组
    const timeUnitList = computed(() => {
      return props.timeUnitList;
    });
    //   日期禁用
    const disableDateCb = computed(() => {
      return props.disableDateCb;
    });
    //   是否展示时间颗粒度选择框
    const showTimeUnit = computed(() => {
      return props.isShowTimeUnit;
    });
    //   是否展示快捷选时
    const showDateScope = computed(() => {
      return props.showDateScope;
    });
    //   是否可清空
    const clearable = computed(() => {
      return props.clearable;
    });
    // 模式
    const mode = computed(() => {
      return pickerState.dateForm.timeUnit === TIME_UNITS.MINUTES || pickerState.dateForm.timeUnit === TIME_UNITS.HOUR
        ? 'datetimerange'
        : pickerState.dateForm.timeUnit === TIME_UNITS.DAY
        ? 'daterange'
        : pickerState.dateForm.timeUnit === TIME_UNITS.MONTH
        ? 'monthrange'
        : 'yearrange';
    });
    // 格式
    const format = computed(() => {
      return pickerState.dateForm.timeUnit === TIME_UNITS.MINUTES
        ? 'YYYY-MM-DD HH:mm'
        : pickerState.dateForm.timeUnit === TIME_UNITS.HOUR
        ? 'YYYY-MM-DD HH:mm'
        : pickerState.dateForm.timeUnit === TIME_UNITS.DAY
        ? 'YYYY-MM-DD'
        : pickerState.dateForm.timeUnit === TIME_UNITS.MONTH
        ? 'YYYY-MM'
        : 'YYYY';
    });
    // 快捷选时列表
    const scopeList = ref<Common_IValueLabel<string>[]>([]);
    // 数据
    const pickerState = reactive<PickerState>({
      dateForm: {
        dateScope: scopeList.value?.[0]?.value ?? '',
        timeUnit: props.timeUnit,
        date: [],
      },
      message: '',
    });
    /**
     * 时间颗粒度切换
     * 需要处理时间到今天或者本月或者本年
     */
    const onTimeUnitChange = () => {
      emit('update:timeUnit', pickerState.dateForm.timeUnit);
    };

    /**
     * 快捷选时
     */
    const handleQuickTimingChange = () => {
      let fastDate = mapDateScopeByQuickTimingType(pickerState.dateForm.dateScope);
      if (props.disableDateCb) {
        switch (pickerState.dateForm.dateScope) {
          case Common_EQuickTimingType.本周:
            fastDate = [startOfISOWeek(new Date()), subDays(new Date(), 1)];
            break;
          case Common_EQuickTimingType.本月:
            fastDate = [startOfMonth(new Date()), subDays(new Date(), 1)];
            break;
        }
      }
      pickerState.dateForm.date = fastDate;
      emit('update:value', pickerState.dateForm.date);
      emit('update:timeUnit', pickerState.dateForm.timeUnit);
    };
    /**
     * 时间切换,处理双向绑定，颗粒度、快捷选时
     * @param value
     * @param message
     */
    const onDateChange = (value: Date[], message: string) => {
      if (!value || value.length !== 2) {
        pickerState.dateForm.dateScope = '';
      }

      pickerState.message = message;
      if (value && pickerState.dateForm.timeUnit === TIME_UNITS.HOUR) {
        value[0]?.setMinutes(0);
        value[1]?.setMinutes(59);
      } else if (value && pickerState.dateForm.timeUnit === TIME_UNITS.MINUTES) {
        value[0]?.setMinutes(Math.floor(value[0]?.getMinutes() / 10) * 10);
        value[1]?.setMinutes(Math.floor(value[1]?.getMinutes() / 10 + 1) * 10 - 1);
      }
      pickerState.dateForm.date = value?.length > 1 ? [value[0], value[1]] : [];
      emit('update:value', pickerState.dateForm.date);
      emit('change', pickerState.dateForm.date, message);
    };

    const setDateScopeDisabled = (val: Common_IValueLabel<string>) => {
      if (props.disableDateCb && val.value === Common_EQuickTimingType.本月 && new Date().getDate() === 1) {
        return true;
      }
      if (props.disableDateCb && val.value === Common_EQuickTimingType.本周 && new Date().getDay() === 1) {
        return true;
      }
      return false;
    };

    /**
     * 监听时间颗粒度
     */
    watch(
      () => props.timeUnit,
      () => {
        pickerState.dateForm.timeUnit = props.timeUnit;
        // 兼容老的默认快捷选时
        if (props.isNewQuickTiming) {
          scopeList.value = mapQuickTimingTypeListByTimeUnit(pickerState.dateForm.timeUnit);
        } else {
          scopeList.value = mapDefaultQuickTimingTypeListByTimeUnit(pickerState.dateForm.timeUnit);
          console.log(scopeList.value);
        }

        nextTick(() => {
          pickerState.dateForm.dateScope = mapQuickTimingTypeByDateScope(
            pickerState.dateForm.date as Date[],
            pickerState.dateForm.timeUnit,
            pickerState.dateForm.dateScope,
          );
        });
      },
    );
    /**
     * 监听双向绑定数据
     */
    watch(
      () => props.value,
      () => {
        if (pickerState.dateForm.timeUnit === TIME_UNITS.MINUTES) {
          props.value[0]?.setMinutes(Math.floor(props.value[0]?.getMinutes() / 10) * 10);
          props.value[1]?.setMinutes(Math.floor(props.value[1]?.getMinutes() / 10 + 1) * 10 - 1);
        }
        pickerState.dateForm.date = props.value;

        nextTick(() => {
          let dateScopeDate = cloneDeep(pickerState.dateForm.date);
          if (props.disableDateCb) {
            const fastWeekDate = [startOfISOWeek(new Date()), subDays(new Date(), 1)];
            const fastMonthDate = [startOfMonth(new Date()), subDays(new Date(), 1)];
            if (
              formatDate(dateScopeDate[0], 'yyyy-MM-dd') === formatDate(fastWeekDate[0], 'yyyy-MM-dd') &&
              formatDate(dateScopeDate[1], 'yyyy-MM-dd') === formatDate(fastWeekDate[1], 'yyyy-MM-dd')
            ) {
              dateScopeDate = [startOfISOWeek(new Date()), new Date()];
            }
            if (
              formatDate(dateScopeDate[0], 'yyyy-MM-dd') === formatDate(fastMonthDate[0], 'yyyy-MM-dd') &&
              formatDate(dateScopeDate[1], 'yyyy-MM-dd') === formatDate(fastMonthDate[1], 'yyyy-MM-dd')
            ) {
              dateScopeDate = [startOfMonth(new Date()), new Date()];
            }
          }
          pickerState.dateForm.dateScope = mapQuickTimingTypeByDateScope(
            dateScopeDate as Date[],
            pickerState.dateForm.timeUnit,
            pickerState.dateForm.dateScope,
          );
        });
      },
    );

    return {
      timeUnitList,
      showTimeUnit,
      showDateScope,
      scopeList,
      mode,
      format,
      clearable,
      setDateScopeDisabled,
      ...toRefs(pickerState),
      onTimeUnitChange,
      handleQuickTimingChange,
      onDateChange,
      disableDateCb,
    };
  },
});
