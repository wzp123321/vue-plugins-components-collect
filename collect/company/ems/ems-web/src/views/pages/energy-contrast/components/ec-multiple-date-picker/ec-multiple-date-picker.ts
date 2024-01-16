import { defineComponent, PropType, ref, onMounted } from 'vue';
// utils
import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInYears,
  endOfMonth,
  isThisMonth,
  isThisYear,
  isToday,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { formatDate } from '@/utils/index';
// 组件
import CommonCalendar from '../ec-common-calendar/ec-common-calendar.vue';
import ChooseDate from '../ec-choose-date/ec-choose-date.vue';
import ChooseMonth from '../ec-choose-month/ec-choose-month.vue';
import ChooseYear from '../ec-choose-year/ec-choose-year.vue';
// 配置
import { dateScopeListAll } from '@/config/config';
import { EC_IMultipleCbVO, EMultipleTimeType } from '../../energy-contrast.api';
import { Common_ETimeUnit, Common_ICodeName } from '@/services/common/common-api';
import message from '@/utils/message';

export default defineComponent({
  name: 'MultipleDatePicker',
  components: {
    CommonCalendar,
    ChooseDate,
    ChooseMonth,
    ChooseYear,
  },
  props: {
    // 快捷选时
    dateScopeAll: {
      type: Number,
      default: 0,
    },
    // 时间
    dateList: {
      type: Array as PropType<string[]>,
      default: [],
    },
    // 颗粒度
    timeUnit: {
      type: String as PropType<Common_ETimeUnit>,
      default: Common_ETimeUnit.十分钟,
    },
    // 颗粒度数组-全量
    timeUnitList: {
      type: Array as PropType<Common_ICodeName[]>,
      default: [],
    },
  },
  emits: ['update:dateScopeAll', 'update:dateList', 'update:timeUnit'],
  setup(props, { emit }) {
    // 快捷选时
    const dateScope = ref<EMultipleTimeType>(props.dateScopeAll);
    // 时间段
    const dateTimeList = ref<string[]>(props.dateList);
    // 时间颗粒度
    const timeUnit = ref<Common_ETimeUnit>(Common_ETimeUnit.十分钟);
    // 时间颗粒度数组
    const timeUnitList = ref<Common_ICodeName[]>([]);
    // 任意时间段
    const randomDate = ref<Date[]>([]);
    /**
     * 颗粒度数组
     * @returns
     */
    const mapTimeUnitList = () => {
      let start = 0;
      let end = 2;
      switch (dateScope.value) {
        case EMultipleTimeType.日:
          start = 0;
          end = 2;
          break;
        case EMultipleTimeType.周:
          start = 1;
          end = 3;
          break;
        case EMultipleTimeType.月:
          start = 1;
          end = 3;
          break;
        case EMultipleTimeType.年:
          start = 3;
          end = 5;
          break;
        case EMultipleTimeType.任意时间段:
          start = 0;
          end = props.timeUnitList.length;
          break;
      }
      timeUnitList.value = props.timeUnitList.slice(start, end);
    };
    /**
     * 处理表单文本
     * @param type
     * @returns
     */
    const mapFormItemLabel = (type: EMultipleTimeType) => {
      const labelMap = {
        [EMultipleTimeType.日]: '选择日期',
        [EMultipleTimeType.周]: '选择周',
        [EMultipleTimeType.月]: '选择月份',
        [EMultipleTimeType.年]: '选择年份',
        [EMultipleTimeType.任意时间段]: '日期',
      };
      return labelMap[type];
    };
    // 格式
    const mapRandomDateFormat = () => {
      const labelMap = {
        [Common_ETimeUnit.十分钟]: 'YYYY-MM-DD',
        [Common_ETimeUnit.小时]: 'YYYY-MM-DD',
        [Common_ETimeUnit.天]: 'YYYY-MM-DD',
        [Common_ETimeUnit.月]: 'YYYY-MM',
        [Common_ETimeUnit.年]: 'YYYY',
      };
      return labelMap[timeUnit.value];
    };
    // 模式
    const mapMode = () => {
      const labelMap = {
        [Common_ETimeUnit.十分钟]: 'daterange',
        [Common_ETimeUnit.小时]: 'daterange',
        [Common_ETimeUnit.天]: 'daterange',
        [Common_ETimeUnit.月]: 'monthrange',
        [Common_ETimeUnit.年]: 'yearrange',
      };
      return labelMap[timeUnit.value];
    };
    /**
     * 切换快捷选时
     * 切换 日 周 月 年
     */
    const handleDateScopeChange = (item: { label: string; title: string; value: EMultipleTimeType }) => {
      dateScope.value = item.value;
      dateTimeList.value = [];
      // 重新生成时间颗粒度数组
      mapTimeUnitList();
      timeUnit.value = timeUnitList.value?.[0]?.code as Common_ETimeUnit;
      // 根据快捷选时生成对应时间
      getChooseTimeListByScope(item.value);

      emit('update:dateScopeAll', dateScope.value);
      emit('update:timeUnit', timeUnit.value);
    };
    // 根据日周月年修改默认时间数组
    const getChooseTimeListByScope = (scopeType: EMultipleTimeType) => {
      let startDate;
      let endDate;
      switch (scopeType) {
        case EMultipleTimeType.日:
          // 今天 昨天
          startDate = new Date();
          endDate = new Date(subDays(new Date(), 1));
          dateTimeList.value = [formatDate(startDate, 'yyyy-MM-dd HH:mm'), formatDate(endDate, 'yyyy-MM-dd HH:mm')];
          break;
        case EMultipleTimeType.周:
          // 当前周 上一周
          const startOfWeek = startOfISOWeek(subDays(startOfISOWeek(new Date()), 1));
          const endOfWeek = startOfISOWeek(new Date());
          dateTimeList.value = [formatDate(startOfWeek, 'yyyy-MM-dd HH:mm'), formatDate(endOfWeek, 'yyyy-MM-dd HH:mm')];
          break;
        case EMultipleTimeType.月:
          startDate = startOfMonth(subMonths(new Date(), 1));
          endDate = startOfMonth(new Date());
          dateTimeList.value = [formatDate(startDate, 'yyyy-MM-dd HH:mm'), formatDate(endDate, 'yyyy-MM-dd HH:mm')];
          break;
        case EMultipleTimeType.年:
          startDate = startOfYear(subYears(new Date(), 1));
          endDate = startOfYear(new Date());
          dateTimeList.value = [formatDate(startDate, 'yyyy-MM-dd HH:mm'), formatDate(endDate, 'yyyy-MM-dd HH:mm')];
          break;
        default:
          dateTimeList.value = [];
          break;
      }

      emit('update:dateList', dateTimeList.value);
    };
    /**
     * 日期禁用
     */
    const disabledDate = (current: Date) => {
      return new Date(current).getTime() > new Date().getTime();
    };
    /**
     * 日期选择
     * @param dates {(EC_IMultipleCbVO | string)[]}
     * @param flag {string}
     */
    const getChooseDateValue = (dates: (EC_IMultipleCbVO | string)[], flag: string) => {
      dateTimeList.value = [];
      if (flag === 'month') {
        dateTimeList.value = dates?.map((item) => {
          return `${(item as EC_IMultipleCbVO).year}-${
            (item as EC_IMultipleCbVO).value > 9
              ? (item as EC_IMultipleCbVO).value
              : '0' + (item as EC_IMultipleCbVO).value
          }-01`;
        });
      } else if (flag === 'year') {
        dateTimeList.value = dates?.map((item) => `${item}-01-01`);
      } else {
        dateTimeList.value = dates as string[];
      }
      emit('update:dateList', dateTimeList.value);
    };
    /**
     * 任意时间段选择器-change
     * @returns
     */
    const handleRandomDateChange = () => {
      if (!randomDate.value || !randomDate.value?.[0] || !randomDate.value[1]) {
        return;
      }
      /**
       * 处理时间，如果非当天结束时间处理成23：59，如果是当天结束时间处理成当前时间
       * 年月同理
       */
      if ([Common_ETimeUnit.年]?.includes(timeUnit.value)) {
        const thisYearFlag = isThisYear(randomDate.value[1] as Date);
        const m = thisYearFlag ? new Date().getMonth() : 11;
        randomDate.value[1].setMonth(m);
      }
      if ([Common_ETimeUnit.月, Common_ETimeUnit.年]?.includes(timeUnit.value)) {
        const thisMonthFlag = isThisMonth(randomDate.value[1] as Date);
        const d = thisMonthFlag ? new Date().getDate() : endOfMonth(randomDate.value[1] as Date).getDate();
        randomDate.value[1].setDate(d);
      }
      if ([Common_ETimeUnit.天, Common_ETimeUnit.月, Common_ETimeUnit.年]?.includes(timeUnit.value)) {
        const todayFlag = isToday(randomDate.value[1] as Date);
        const h = todayFlag ? new Date().getHours() : 23;
        const m = todayFlag ? new Date().getMinutes() : 59;
        randomDate.value[1].setHours(h);
        randomDate.value[1].setMinutes(m);
      }
      if ([Common_ETimeUnit.小时, Common_ETimeUnit.十分钟]?.includes(timeUnit.value)) {
        randomDate.value[0]?.setHours(0);
        randomDate.value[0]?.setMinutes(0);
        const todayFlag = isToday(randomDate.value[1] as Date);
        randomDate.value[1]?.setHours(todayFlag ? new Date().getHours() : 23);
        randomDate.value[1]?.setMinutes(todayFlag ? new Date().getMinutes() : 59);
      }

      /**
       * 根据颗粒度限制选择范围
       */
      if (
        timeUnit.value === Common_ETimeUnit.十分钟 &&
        randomDate.value &&
        randomDate.value?.length === 2 &&
        differenceInHours(randomDate.value[1] as Date, randomDate.value[0] as Date) > 24
      ) {
        randomDate.value = [];
        message.error('当前颗粒度下日期跨度不能超过24h');
        return;
      }
      if (
        timeUnit.value === Common_ETimeUnit.小时 &&
        randomDate.value &&
        randomDate.value?.length === 2 &&
        differenceInDays(randomDate.value[1] as Date, randomDate.value[0] as Date) > 30
      ) {
        randomDate.value = [];
        message.error('当前颗粒度下日期跨度不能超过31天');
        return;
      }
      if (
        timeUnit.value === Common_ETimeUnit.天 &&
        randomDate.value &&
        randomDate.value?.length === 2 &&
        differenceInDays(randomDate.value[1] as Date, randomDate.value[0] as Date) > 365
      ) {
        randomDate.value = [];
        message.error('当前颗粒度下日期跨度不能超过366天');
        return;
      }
      if (!randomDate.value || randomDate.value?.length === 0) {
        message.error('请选择日期！');
        return;
      }
      if (dateTimeList.value?.length === 10) {
        message.error('日期最多可选10个！');
        return;
      }

      addRandomDateList();
    };
    /**
     * 任意时间段--添加时间
     * @returns
     */
    const addRandomDateList = () => {
      if (checkLength()) {
        message.error('时间区间长度需一致！');
        return;
      }
      // 是否重复
      const repeatFlag = dateTimeList.value.some((item) => {
        return (
          `${formatDate(randomDate.value[0], 'yyyy-MM-dd')}~${formatDate(randomDate.value[1], 'yyyy-MM-dd')}` === item
        );
      });
      if (repeatFlag) {
        message.error('当前时间已存在！');
        return;
      }

      dateTimeList.value.push(
        formatDate(randomDate.value[0], 'yyyy-MM-dd HH:mm') + '~' + formatDate(randomDate.value[1], 'yyyy-MM-dd HH:mm'),
      );

      emit('update:dateList', dateTimeList.value);
    };
    /**
     * 校验当前选择的时间段与上一次选中的时间段，间隔是否一致
     * 根据时间颗粒度，比较间隔分钟、小时、天、月、年
     * @returns
     */
    const checkLength = () => {
      const labelMap = {
        [Common_ETimeUnit.十分钟]: 'yyyy-MM-dd',
        [Common_ETimeUnit.小时]: 'yyyy-MM-dd',
        [Common_ETimeUnit.天]: 'yyyy-MM-dd',
        [Common_ETimeUnit.月]: 'yyyy-MM',
        [Common_ETimeUnit.年]: 'yyyy',
      };
      const formatStr = labelMap[timeUnit.value];

      let lenFlag = false;
      const start = new Date(formatDate(randomDate.value[0], formatStr));
      const end = new Date(formatDate(randomDate.value[1], formatStr));
      if (dateTimeList.value.length > 0) {
        const timeArr = dateTimeList.value[0].split('~');

        const chooseStart = new Date(formatDate(new Date(timeArr[0]), formatStr));
        const chooseEnd = new Date(formatDate(new Date(timeArr[1]), formatStr));
        let lastSubMin;
        let currentSubMin;
        if (mapIsDayPicker()) {
          lastSubMin = differenceInDays(chooseEnd, chooseStart);
          currentSubMin = differenceInDays(end, start);
        } else if (timeUnit.value === Common_ETimeUnit.月) {
          lastSubMin = differenceInMonths(chooseEnd, chooseStart);
          currentSubMin = differenceInMonths(end, start);
        } else if (timeUnit.value === Common_ETimeUnit.年) {
          lastSubMin = differenceInYears(chooseEnd, chooseStart);
          currentSubMin = differenceInYears(end, start);
        }
        lenFlag = lastSubMin !== currentSubMin;
      }

      return lenFlag;
    };
    /**
     * 清空任意时间段
     */
    const handleRandomDateClear = () => {
      dateTimeList.value = [];
      randomDate.value = [];

      emit('update:dateList', dateTimeList.value);
    };
    /**
     * 切换颗粒度
     */
    const handleTimeUnitChange = () => {
      if (dateScope.value === EMultipleTimeType.任意时间段) {
        handleRandomDateClear();
      }
      emit('update:timeUnit', timeUnit.value);
    };
    /**
     * 根据颗粒度处理时间显示
     * @param dateStr
     * @returns
     */
    const mapSelectedDate = (dateStr: string) => {
      const dateArr = dateStr?.split('~');
      let formatStr = 'yyyy-MM-dd';
      if (mapIsDayPicker()) {
        formatStr = 'yyyy-MM-dd';
      } else if (timeUnit.value === Common_ETimeUnit.月) {
        formatStr = 'yyyy-MM';
      } else if (timeUnit.value === Common_ETimeUnit.年) {
        formatStr = 'yyyy';
      }
      return `${formatDate(new Date(dateArr?.[0]), formatStr)}~${formatDate(new Date(dateArr?.[1]), formatStr)}`;
    };
    /**
     * 十分钟、小时、天颗粒度
     * @returns
     */
    const mapIsDayPicker = () => {
      return [Common_ETimeUnit.十分钟, Common_ETimeUnit.小时, Common_ETimeUnit.天].includes(timeUnit.value);
    };

    /**
     * 初始化
     */
    onMounted(() => {
      mapTimeUnitList();
      timeUnit.value = timeUnitList.value?.[0]?.code as Common_ETimeUnit;
      emit('update:timeUnit', timeUnit.value);
    });

    return {
      randomDate,
      dateScope,
      dateTimeList,
      timeUnit,
      dateScopeListAll,
      EMultipleTimeType,
      timeUnitList,

      disabledDate,
      mapFormItemLabel,
      handleDateScopeChange,
      getChooseDateValue,
      handleRandomDateChange,
      handleRandomDateClear,
      handleTimeUnitChange,
      mapRandomDateFormat,
      mapMode,
      mapSelectedDate,
    };
  },
});
