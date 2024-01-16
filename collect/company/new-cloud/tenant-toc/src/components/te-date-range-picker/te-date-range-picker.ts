import { computed, defineComponent, reactive, toRefs, PropType, watch } from 'vue';
// utils
import { differenceInHours, differenceInDays, isToday } from 'date-fns';

import { customPrefix, customClose } from '../../utils/index';

interface RangeState {
  value: Date[];
  startDate: Date | null;
  endDate: Date | null;
}

export default defineComponent({
  name: 'DateRangePicker',
  props: {
    // 双向绑定
    value: {
      type: Array as PropType<Date[]>,
      default: () => [],
    },
    // 模式
    mode: {
      type: String as PropType<'datetimerange' | 'daterange' | 'monthrange' | 'yearrange'>,
      default: 'datetimerange',
    },
    // 宽度
    width: {
      type: Number || String,
      default: 360,
    },
    // 分隔符
    separator: {
      type: String,
      default: '~',
    },
    // placeholder
    placeholder: {
      type: Array as PropType<string[]>,
      default: () => ['开始日期', '结束日期'],
    },
    // 格式
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    // 是否可删除
    clearable: {
      type: Boolean,
      default: true,
    },
    // 文本框是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 时间颗粒度
    timeUnit: {
      type: String,
      default: '10m',
    },
    // 日期禁用回调函数
    disabledDate: {
      type: Function,
    },
    // 开始年禁用
    disabledStartYear: {
      type: Function,
    },
    // 结束年禁用
    disabledEndYear: {
      type: Function,
    },
  },
  emits: ['update:value', 'change', 'onFocus'],
  setup(props, { emit }) {
    //   模式
    const mode = computed(() => {
      return props.mode;
    });
    //   分隔符
    const separator = computed(() => {
      return props.separator;
    });
    //   placeholder
    const placeholder = computed(() => {
      return props.placeholder;
    });
    //   格式
    const format = computed(() => {
      return props.format;
    });
    //   是否可删除
    const clearable = computed(() => {
      return props.clearable;
    });
    //   文本框是否课编辑
    const editable = computed(() => {
      return props.editable;
    });

    const defaultTime = [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]; // '12:00:00', '08:00:00'

    // 计算宽度
    const computedWidth = computed(() => {
      let w = '';
      if (Object.prototype.toString.call(props.width) === '[object Number]') {
        w = `${props.width}px`;
      } else if (Object.prototype.toString.call(props.width) === '[object String]') {
        w = `${props.width}`;
      }
      return w;
    });
    const rangeState = reactive<RangeState>({
      value: [],
      startDate: null,
      endDate: null,
    });
    // 日期禁用
    // const disabledDate = (date: Date) => {
    //   return (
    //     (!rangeState.endDate ? date.getTime() > new Date().getTime() : date.getTime() > rangeState.endDate.getTime()) ||
    //     (!rangeState.startDate
    //       ? date.getTime() < new Date().getTime()
    //       : date.getTime() < rangeState.startDate.getTime())
    //   );
    // };
    // 禁用小时
    const disabledHours = (type: string) => {
      let arr = [];
      const dateEle = document.querySelector(
        `.te-date-range-picker .te-date-range-picker__time-header ${
          type === 'start' ? '.te-date-range-picker__editors-wrap' : '.te-date-range-picker__editors-wrap.is-right'
        } .te-date-range-picker__editor>input`,
      );
      if (dateEle) {
        const dateStr = (dateEle as any).value;
        // 如果开始时间选择了
        if (rangeState.value?.[0] && isToday(new Date(dateStr))) {
          const hour = new Date().getHours();
          for (let key = 0; key < 24; key++) {
            if (key > hour) {
              arr.push(key);
            }
          }
        } else {
          arr = [];
        }
      }
      return arr;
    };
    // 禁用分钟
    const disabledMinutes = (hour: number, type: string) => {
      const arr = [];
      const dateEle = document.querySelector(
        `.te-date-range-picker .te-date-range-picker__time-header ${
          type === 'start' ? '.te-date-range-picker__editors-wrap' : '.te-date-range-picker__editors-wrap.is-right'
        } .te-date-range-picker__editor>input`,
      );
      // 如果是今天
      if (dateEle) {
        const dateStr = (dateEle as any).value;
        if (rangeState.value && rangeState.value[1] && isToday(new Date(dateStr))) {
          // 获取时
          const min = new Date().getMinutes();
          for (let key = 0; key < 60; key++) {
            if (key > min && hour === new Date().getHours()) {
              arr.push(key);
            }
          }
        }
      }
      return arr;
    };
    // 禁用开始年
    // const disabledStartYear = (date: Date) => {
    //   return (
    //     (!rangeState.endDate ? date.getTime() > new Date().getTime() : date.getTime() > rangeState.endDate.getTime()) ||
    //     (!rangeState.startDate
    //       ? date.getTime() < new Date().getTime()
    //       : date.getTime() < rangeState.startDate.getTime())
    //   );
    // };
    // 禁用结束年
    // const disabledEndYear = (date: Date) => {
    //   return (
    //     date.getTime() > new Date().getTime() ||
    //     (rangeState.startDate && date.getTime() < rangeState.startDate.getTime())
    //   );
    // };
    // change
    const onDateChange = () => {
      // console.log(rangeState.value);
      emit('update:value', rangeState.value);
      emit('change', rangeState.value, checkDateRange());
    };
    // 开始年change
    const onStartDateChange = () => {
      emit('update:value', [rangeState.startDate, rangeState.endDate]);
      emit('change', [rangeState.startDate, rangeState.endDate], '');
    };
    // 结束年change
    const onEndDateChange = () => {
      if (!rangeState.endDate) {
        rangeState.startDate = null;
      }
      emit('update:value', [rangeState.startDate, rangeState.endDate]);
      emit('change', [rangeState.startDate, rangeState.endDate], '');
    };
    const onFocus = () => {
      emit('onFocus', true);
    };
    const onBlur = () => {
      emit('onFocus', false);
    };
    // 工具函数 校验时间范围是否规范
    const checkDateRange = () => {
      let message = '';
      switch (props.timeUnit) {
        case '10m':
          if (
            rangeState.value &&
            rangeState.value?.length === 2 &&
            differenceInHours(rangeState.value[1] as Date, rangeState.value[0] as Date) > 24
          ) {
            message = '当前颗粒度下时间跨度不能超过24h!';
          }
          break;
        case '1h':
          if (
            rangeState.value &&
            rangeState.value?.length === 2 &&
            differenceInDays(rangeState.value[1] as Date, rangeState.value[0] as Date) > 31
          ) {
            message = '当前颗粒度下时间跨度不能超过31天!';
          }
          break;
        case '1d':
          if (
            rangeState.value &&
            rangeState.value?.length === 2 &&
            differenceInDays(rangeState.value[1] as Date, rangeState.value[0] as Date) > 366
          ) {
            message = '当前颗粒度下时间跨度不能超过366天!';
          }
          break;
        case '1d':
      }
      return message;
    };

    /**
     * 监听数据变化
     */
    watch(
      () => props.value,
      (newVal) => {
        if (props.mode !== 'yearrange') {
          rangeState.value = newVal;
        } else {
          rangeState.startDate = newVal[0];
          rangeState.endDate = newVal[1];
        }
      },
      {
        immediate: true,
      },
    );

    return {
      ...toRefs(rangeState),
      computedWidth,
      mode,
      format,
      separator,
      placeholder,
      clearable,
      editable,
      defaultTime,
      customPrefix,
      customClose,

      // disabledDate,
      onDateChange,
      onStartDateChange,
      onEndDateChange,
      disabledHours,
      disabledMinutes,
      // disabledStartYear,
      // disabledEndYear,
      onFocus,
      onBlur,
    };
  },
});
