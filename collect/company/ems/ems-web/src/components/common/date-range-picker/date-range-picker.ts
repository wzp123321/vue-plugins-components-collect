import { computed, defineComponent, reactive, toRefs, PropType, watch } from 'vue';
// utils
import { differenceInHours, differenceInDays, isToday } from 'date-fns';

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
      default: 'YYYY-MM-DD HH',
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
    // 日期禁用回调
    disableDateCb: {},
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
    // 时分--默认时间
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
    const disabledDate = (date: Date) => {
      return typeof props.disableDateCb === 'function' ? props.disableDateCb(date) : date.getTime() > Date.now();
    };
    /**
     * 禁用小时,能打开弹出层说明已选了开始结束日期
     * @param type
     * @returns
     */
    const disabledHours = (type: string) => {
      let disabledHourList: number[] = [];
      const { startDate, startTime, endDate, endTime } = mapHeaderDateTime();
      if (type === 'start') {
        // 开始结束日期一致才需要禁用
        if (startDate === endDate) {
          // 结束时间-小时
          let h = Number(endTime?.split(':')?.[0]) + 1;
          // 或者开始日期等于当前天
          if (isToday(new Date(startDate))) {
            h = Math.min(h, new Date().getHours() + 1);
          }
          disabledHourList = makeRange(h, 23);
        }
      } else {
        // 开始结束日期一致才需要禁用
        if (startDate === endDate) {
          // 结束时间-小时
          const h = Number(startTime?.split(':')?.[0]);
          disabledHourList = makeRange(0, h - 1);

          // 或者开始日期等于当前天
          if (isToday(new Date(endDate))) {
            disabledHourList = [...disabledHourList, ...makeRange(new Date().getHours() + 1, 23)];
          }
        } else {
          // 或者开始日期等于当前天
          if (isToday(new Date(endDate))) {
            disabledHourList = makeRange(new Date().getHours() + 1, 23);
          }
        }
      }
      return disabledHourList;
    };
    /**
     * 禁用分钟
     * @param hour
     * @param type
     * @returns
     */
    const disabledMinutes = (hour: number, type: string) => {
      let disabledMinuteList: number[] = [];
      const { startDate, startTime, endDate, endTime } = mapHeaderDateTime();
      if (type === 'start') {
        const h = Number(endTime?.split(':')?.[0]);
        // 开始结束日期一致才需要禁用
        if (startDate === endDate && hour === h) {
          // 结束时间-小时
          let m = Number(endTime?.split(':')?.[1]);
          // 或者开始日期等于当前天
          if (isToday(new Date(startDate))) {
            m = Math.min(m, new Date().getMinutes() + 1);
          }
          disabledMinuteList = makeRange(m + 1, 60);
        }
      } else {
        // 开始结束日期一致才需要禁用
        const sh = Number(startTime?.split(':')?.[0]);
        if (startDate === endDate && sh === hour) {
          // 结束时间-小时
          const m = Number(startTime?.split(':')?.[1]);
          disabledMinuteList = makeRange(0, m - 1);

          // 或者开始日期等于当前天
          if (isToday(new Date(startDate))) {
            disabledMinuteList = [...disabledMinuteList, ...makeRange(new Date().getMinutes() + 1, 60)];
          }
        } else {
          if (isToday(new Date(endDate)) && hour === new Date().getHours()) {
            disabledMinuteList = makeRange(new Date().getMinutes() + 1, 60);
          }
        }
      }
      return disabledMinuteList;
    };
    /**
     * 生成头部时间
     * @returns
     */
    const mapHeaderDateTime = () => {
      // 开始日期
      const startDate = (
        document.querySelector(
          '.el-date-range-picker__editors-wrap .el-date-range-picker__time-picker-wrap input[placeholder="开始日期"]',
        ) as HTMLInputElement
      )?.value;
      // 开始时间
      const startTime = (
        document.querySelector(
          '.el-date-range-picker__editors-wrap .el-date-range-picker__time-picker-wrap input[placeholder="开始时间"]',
        ) as HTMLInputElement
      )?.value;
      // 结束日期
      const endDate = (
        document.querySelector(
          '.el-date-range-picker__editors-wrap.is-right .el-date-range-picker__time-picker-wrap input[placeholder="结束日期"]',
        ) as HTMLInputElement
      )?.value;
      // 结束时间
      const endTime = (
        document.querySelector(
          '.el-date-range-picker__editors-wrap.is-right .el-date-range-picker__time-picker-wrap input[placeholder="结束时间"]',
        ) as HTMLInputElement
      )?.value;

      return {
        startDate,
        startTime,
        endDate,
        endTime,
      };
    };
    /**
     * 生成数字数组
     * @param start
     * @param end
     * @returns
     */
    const makeRange = (start: number, end: number) => {
      const result: number[] = [];
      for (let index = start; index <= end; index++) {
        result.push(index);
      }
      return result;
    };
    // 禁用开始年
    const disabledStartYear = (date: Date) => {
      return !rangeState.endDate
        ? date.getTime() > new Date().getTime()
        : date.getTime() > rangeState.endDate.getTime();
    };
    // 禁用结束年
    const disabledEndYear = (date: Date) => {
      return (
        date.getTime() > new Date().getTime() ||
        (rangeState.startDate && date.getTime() < rangeState.startDate.getTime())
      );
    };
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
      }
      return message;
    };

    /**
     * 监听数据变化
     */
    watch(
      () => props.value,
      (newVal) => {
        rangeState.value = newVal ?? [];
        rangeState.startDate = newVal?.[0];
        rangeState.endDate = newVal?.[1];
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

      disabledDate,
      onDateChange,
      onStartDateChange,
      onEndDateChange,
      disabledHours,
      disabledMinutes,
      disabledStartYear,
      disabledEndYear,
      onFocus,
      onBlur,
    };
  },
});
