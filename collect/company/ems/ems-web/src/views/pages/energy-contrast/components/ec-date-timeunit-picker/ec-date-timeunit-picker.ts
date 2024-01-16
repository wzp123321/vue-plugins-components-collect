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
import { defineComponent, toRefs, PropType, computed, reactive, watch } from 'vue';
// config
import { dateScopeList } from '@/config/config';
import { TIME_UNITS } from '@/config/enum';
// utils
import { startOfDay, startOfWeek, startOfMonth, isToday } from 'date-fns';
import { formatDate } from '@/utils/index';
import { cloneDeep } from 'lodash';

interface PickerState {
  dateForm: {
    dateScope: number;
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
    // 日期禁用
    disableDateCb: {},
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
      return mapIsDayPicker()
        ? 'daterange'
        : pickerState.dateForm.timeUnit === TIME_UNITS.MONTH
        ? 'monthrange'
        : 'yearrange';
    });
    // 格式
    const format = computed(() => {
      return mapIsDayPicker() ? 'YYYY-MM-DD' : pickerState.dateForm.timeUnit === TIME_UNITS.MONTH ? 'YYYY-MM' : 'YYYY';
    });
    // 快捷选时
    const scopeList = computed(() => {
      let list: Array<{ value: number; label: string }> = [];
      switch (pickerState.dateForm.timeUnit) {
        case TIME_UNITS.MINUTES:
          list = dateScopeList.slice(0, 1);
          break;
        case TIME_UNITS.HOUR:
          list = dateScopeList;
          break;
        case TIME_UNITS.DAY:
          list = dateScopeList.slice(1, dateScopeList.length);
          break;
        case TIME_UNITS.MONTH:
        case TIME_UNITS.YEAR:
          list = [];
          break;
      }
      return list;
    });
    const pickerState = reactive<PickerState>({
      dateForm: {
        dateScope: dateScopeList[0].value,
        timeUnit: props.timeUnit,
        date: [],
      },
      message: '',
    });
    const mapIsDayPicker = () => {
      return [TIME_UNITS.DAY, TIME_UNITS.HOUR, TIME_UNITS.MINUTES].includes(
        pickerState.dateForm.timeUnit as TIME_UNITS,
      );
    };
    /**
     * 时间颗粒度切换
     * 需要处理时间到今天或者本月或者本年
     */
    const onTimeUnitChange = () => {
      emit('update:timeUnit', pickerState.dateForm.timeUnit);
    };
    // 快捷选时change
    const onDateScopeChange = () => {
      if (pickerState.dateForm.dateScope === 0) {
        // 今日
        if (pickerState.dateForm.timeUnit === TIME_UNITS.HOUR) {
          pickerState.dateForm.date = [startOfDay(new Date()), new Date()];
        } else {
          pickerState.dateForm.date = [startOfDay(new Date()), new Date()];
        }
      } else if (pickerState.dateForm.dateScope === 1) {
        // 本周
        const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
        pickerState.dateForm.date = [startWeek, new Date()];
      } else if (pickerState.dateForm.dateScope === 2) {
        // 本月
        const startMonth = startOfMonth(new Date());
        pickerState.dateForm.date = [startMonth, new Date()];
      }
      emit('update:value', pickerState.dateForm.date);
      emit('update:timeUnit', pickerState.dateForm.timeUnit);
    };
    /**
     * 时间切换
     */
    const onDateChange = (value: Date[], message: string) => {
      if (!value || value.length !== 2) {
        pickerState.dateForm.dateScope = -1;
      }

      pickerState.message = message;
      if (value && mapIsDayPicker()) {
        value[0]?.setHours(0);
        value[0]?.setMinutes(0);

        const todayFlag = isToday(value[1]);
        value[1]?.setHours(todayFlag ? new Date().getHours() : 23);
        value[1]?.setMinutes(todayFlag ? new Date().getMinutes() : 59);
      }
      pickerState.dateForm.date = value?.length > 1 ? [value[0], value[1]] : [];
      console.log('%c✨✨时间选择✨✨', 'font-size: 24px', pickerState.dateForm.date);
      emit('update:value', pickerState.dateForm.date);
      emit('change', pickerState.dateForm.date, message);
      dateToShortTime(value ?? []);
    };
    /**
     * 时间选择反选快捷选时
     */
    const dateToShortTime = (date: Date[]) => {
      if (!date || date?.length === 0) {
        pickerState.dateForm.date = [];
        pickerState.dateForm.dateScope = -1;
        return;
      }
      const serDate = formatDate(new Date(), 'yyyy-MM-dd');
      const startWeek = formatDate(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const startMonth = formatDate(startOfMonth(new Date()), 'yyyy-MM-dd');
      const start = date[0] ? formatDate(date[0], 'yyyy-MM-dd') : '';
      const end = date[1] ? formatDate(date[1], 'yyyy-MM-dd') : '';
      if (start === serDate && end === serDate) {
        if (start === startWeek && pickerState.dateForm.dateScope === 1) {
          pickerState.dateForm.dateScope = 1;
        } else if (start === startMonth && pickerState.dateForm.dateScope === 2) {
          pickerState.dateForm.dateScope = 2;
        } else {
          pickerState.dateForm.dateScope = 0;
        }
      } else if (start === startWeek && end === serDate) {
        pickerState.dateForm.dateScope = 1;
      } else if (start === startMonth && end === serDate) {
        pickerState.dateForm.dateScope = 2;
      } else {
        pickerState.dateForm.dateScope = -1;
      }
    };
    /**
     * 监听时间颗粒度
     */
    watch(
      () => props.timeUnit,
      () => {
        pickerState.dateForm.timeUnit = props.timeUnit;
      },
      {
        immediate: true,
      },
    );
    /**
     * 监听双向绑定数据
     */
    watch(
      () => props.value,
      () => {
        pickerState.dateForm.date = cloneDeep(props.value);
        if (pickerState.dateForm.date && mapIsDayPicker()) {
          pickerState.dateForm.date[0]?.setHours(0);
          pickerState.dateForm.date[0]?.setMinutes(0);

          const todayFlag = isToday(pickerState.dateForm.date[1] as Date);
          pickerState.dateForm.date[1]?.setHours(todayFlag ? new Date().getHours() : 23);
          pickerState.dateForm.date[1]?.setMinutes(todayFlag ? new Date().getMinutes() : 59);
        }
        // 解决重置数据---快捷选时没勾选----20230908日--放开
        dateToShortTime(props.value);
      },
      {
        immediate: true,
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
      ...toRefs(pickerState),
      onTimeUnitChange,
      onDateScopeChange,
      onDateChange,
      disableDateCb,
    };
  },
});
