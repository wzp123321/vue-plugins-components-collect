import { Common_EQuickTimingType, TIME_UNITS } from '@/config/enum';
import { Common_ETreeType, Common_IValueLabel } from '@/services/common/common-api';
import { formatDate } from '@/utils';
import { endOfMonth, startOfMonth, subMonths, subWeeks } from 'date-fns';
import {
  differenceInHours,
  differenceInDays,
  startOfDay,
  subDays,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfISOWeek,
  endOfISOWeek,
} from 'date-fns';
import { ElMessage } from 'element-plus';
let messageInstance: any;
/**
 * 检验入参字段
 */
export const checkSearchParam = (formSearch: GlobalModule.CommonObject) => {
  if (messageInstance) {
    messageInstance.close();
  }
  if (!formSearch.energyCode || (formSearch.energyCode && formSearch.energyCode.length === 0)) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择能源类型!',
    });
    return false;
  }
  if (!formSearch.treeId || formSearch.treeId?.length === 0) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择分析对象!',
    });
    return false;
  }
  if (+formSearch.radioValue !== +Common_ETreeType.科室 && !formSearch.valueMean) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择能源指标!',
    });
    return false;
  }
  if (!formSearch.timeUnit) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择时间颗粒度！',
    });
    return false;
  }
  if (!formSearch.date || formSearch.date?.length !== 2 || !formSearch.date[0] || !formSearch.date[1]) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择日期！',
    });
    return false;
  }
  if (
    +formSearch.radioValue !== +Common_ETreeType.科室 &&
    formSearch.timeUnit === '10m' &&
    formSearch.date &&
    formSearch.date?.length === 2 &&
    differenceInHours(formSearch.date[1], formSearch.date[0]) > 24
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过24h',
    });
    return false;
  }
  if (
    +formSearch.radioValue !== +Common_ETreeType.科室 &&
    formSearch.timeUnit === '1h' &&
    formSearch.date &&
    formSearch.date?.length === 2 &&
    differenceInDays(formSearch.date[1], formSearch.date[0]) > 30
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过31天',
    });
    return false;
  }
  if (
    formSearch.timeUnit === '1d' &&
    formSearch.date &&
    formSearch.date?.length === 2 &&
    differenceInDays(formSearch.date[1], formSearch.date[0]) > 365
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过366天',
    });
    return false;
  }
  return true;
};

/**
 * 检验请求入参字段
 */
export const checkPageSearchParam = (formSearch: GlobalModule.CommonObject) => {
  if (messageInstance) {
    messageInstance.close();
  }
  if (!formSearch.energyCode || formSearch.energyCode?.length === 0) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择能源类型！',
    });
    return false;
  }
  if (!formSearch.treeId || formSearch.treeId?.length === 0) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择分析对象！',
    });
    return false;
  }
  if (+formSearch.radioValue !== +Common_ETreeType.科室 && !formSearch.valueMean) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择能源指标！',
    });
    return false;
  }
  if (!formSearch.startTime || !formSearch.endTime) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择日期！',
    });
    return false;
  }
  if (!formSearch.timeUnit) {
    messageInstance = ElMessage({
      type: 'error',
      message: '请选择时间颗粒度！',
    });
    return false;
  }
  if (
    +formSearch.radioValue !== +Common_ETreeType.科室 &&
    formSearch.timeUnit === '10m' &&
    differenceInHours(new Date(formSearch.endTime), new Date(formSearch.startTime)) > 24
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过24h！',
    });
    return false;
  }
  if (
    +formSearch.radioValue !== +Common_ETreeType.科室 &&
    formSearch.timeUnit === '1h' &&
    differenceInDays(new Date(formSearch.endTime), new Date(formSearch.startTime)) > 30
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过31天！',
    });
    return false;
  }
  if (
    formSearch.timeUnit === '1d' &&
    differenceInDays(new Date(formSearch.endTime), new Date(formSearch.startTime)) > 365
  ) {
    messageInstance = ElMessage({
      type: 'error',
      message: '当前颗粒度下日期跨度不能超过366天！',
    });
    return false;
  }
  return true;
};

const mapList = (list: Common_EQuickTimingType[]) => {
  return !list || list.length === 0
    ? []
    : Object.entries(Common_EQuickTimingType)
        .filter(([k, v]) => {
          return list.includes(v);
        })
        ?.map(([k, v]) => {
          return {
            value: v,
            label: k,
          };
        });
};
/**
 * 根据时间颗粒度生成对应快捷选时列表
 * @returns
 */
export const mapDefaultQuickTimingTypeListByTimeUnit = (timeUnit: string): Common_IValueLabel<string>[] => {
  let scopeList: Common_IValueLabel<string>[] = [];

  switch (timeUnit) {
    case TIME_UNITS.MINUTES:
      scopeList = mapList([Common_EQuickTimingType.今日]);
      break;
    case TIME_UNITS.HOUR:
      scopeList = mapList([Common_EQuickTimingType.今日, Common_EQuickTimingType.本周, Common_EQuickTimingType.本月]);
      break;
    case TIME_UNITS.DAY:
      scopeList = mapList([Common_EQuickTimingType.本周, Common_EQuickTimingType.本月]);
      break;
    case TIME_UNITS.MONTH:
    case TIME_UNITS.YEAR:
      scopeList = [];
      break;
  }

  return scopeList;
};

/**
 * 根据时间颗粒度生成对应快捷选时列表
 * @returns
 */
export const mapQuickTimingTypeListByTimeUnit = (timeUnit: string): Common_IValueLabel<string>[] => {
  let scopeList: Common_IValueLabel<string>[] = [];

  switch (timeUnit) {
    case TIME_UNITS.MINUTES:
      scopeList = mapList([Common_EQuickTimingType.今日, Common_EQuickTimingType.昨天]);
      break;
    case TIME_UNITS.HOUR:
      scopeList = mapList([
        Common_EQuickTimingType.今日,
        Common_EQuickTimingType.昨天,
        Common_EQuickTimingType.本周,
        Common_EQuickTimingType.上周,
        Common_EQuickTimingType.本月,
        Common_EQuickTimingType.上月,
      ]);
      break;
    case TIME_UNITS.DAY:
      scopeList = mapList([
        Common_EQuickTimingType.本周,
        Common_EQuickTimingType.上周,
        Common_EQuickTimingType.本月,
        Common_EQuickTimingType.上月,
      ]);
      break;
    case TIME_UNITS.MONTH:
    case TIME_UNITS.YEAR:
      scopeList = [];
      break;
  }

  return scopeList;
};

/**
 * 根据颗粒度&时间段返回快捷选时类型
 * @param dates
 * @param timeUnit
 * @param dateScope
 * @returns
 */
export const mapQuickTimingTypeByDateScope = (
  dates: Date[],
  timeUnit: string,
  dateScope: string,
): Common_EQuickTimingType | string => {
  let type = dateScope;
  if (![TIME_UNITS.MONTH, TIME_UNITS.YEAR + ''].includes(timeUnit) && dates?.length > 0) {
    // 十分钟颗粒度
    if (TIME_UNITS.MINUTES === timeUnit) {
      if (mapDateScopeIsToday(dates, timeUnit)) {
        type = Common_EQuickTimingType.今日;
      } else if (mapDateScopeIsYesterday(dates, timeUnit)) {
        type = Common_EQuickTimingType.昨天;
      } else {
        type = '';
      }
    } else if (TIME_UNITS.HOUR === timeUnit) {
      // 小时颗粒度
      if (mapDateScopeIsYesterday(dates, timeUnit)) {
        type = Common_EQuickTimingType.昨天;
      } else if (mapDateScopeIsLastWeek(dates, timeUnit)) {
        type = Common_EQuickTimingType.上周;
      } else if (mapDateScopeIsLastMonth(dates, timeUnit)) {
        type = Common_EQuickTimingType.上月;
      } else if (
        !(
          (dateScope === Common_EQuickTimingType.今日 && mapDateScopeIsToday(dates, timeUnit)) ||
          (dateScope === Common_EQuickTimingType.本周 && mapDateScopeIsThisWeek(dates, timeUnit)) ||
          (dateScope === Common_EQuickTimingType.本月 && mapDateScopeIsThisMonth(dates, timeUnit))
        )
      ) {
        /**
         * 先根据快捷类型以及颗粒度&时间，判断是否已经满足条件
         * 如果时间段满足今天或者本周或者本月，则不往下判断
         */
        if (mapDateScopeIsToday(dates, timeUnit)) {
          type = Common_EQuickTimingType.今日;
        } else if (mapDateScopeIsThisWeek(dates, timeUnit)) {
          type = Common_EQuickTimingType.本周;
        } else if (mapDateScopeIsThisMonth(dates, timeUnit)) {
          type = Common_EQuickTimingType.本月;
        } else {
          type = '';
        }
      }
    } else if (TIME_UNITS.DAY === timeUnit) {
      // 天颗粒度
      if (mapDateScopeIsLastWeek(dates, timeUnit)) {
        type = Common_EQuickTimingType.上周;
      } else if (mapDateScopeIsLastMonth(dates, timeUnit)) {
        type = Common_EQuickTimingType.上月;
      } else if (
        !(
          (dateScope === Common_EQuickTimingType.本周 && mapDateScopeIsThisWeek(dates, timeUnit)) ||
          (dateScope === Common_EQuickTimingType.本月 && mapDateScopeIsThisMonth(dates, timeUnit))
        )
      ) {
        /**
         * 先根据快捷类型以及颗粒度&时间，判断是否已经满足条件
         * 如果时间段满足本周或者本月，则不往下判断
         */
        if (mapDateScopeIsThisWeek(dates, timeUnit)) {
          type = Common_EQuickTimingType.本周;
        } else if (mapDateScopeIsThisMonth(dates, timeUnit)) {
          type = Common_EQuickTimingType.本月;
        } else {
          type = '';
        }
      }
      mapDateScopeIsThisWeek(dates, timeUnit);
      mapDateScopeIsThisMonth(dates, timeUnit);
    }
  }
  console.log('根据颗粒度&时间段返回快捷选时类型----------------------', timeUnit, type);
  return type;
};

/**
 * 根据颗粒度获取格式化
 */
export const mapFormatByTimeUnit = (timeUnit: string) => {
  const map = new Map([
    [TIME_UNITS.MINUTES + '', 'yyyy-MM-dd HH:mm'],
    [TIME_UNITS.HOUR, 'yyyy-MM-dd HH'],
    [TIME_UNITS.DAY, 'yyyy-MM-dd'],
    [TIME_UNITS.MONTH, 'yyyy-MM'],
    [TIME_UNITS.YEAR, 'yyyy'],
  ]);
  return map.get(timeUnit);
};

/**
 * 判断时间段是否是今天
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsToday = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    // 能耗分析有一个把分钟处理成9的逻辑
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const endIndex = timeUnit === TIME_UNITS.MINUTES ? -1 : 999;
    const currentStart = formatDate(dates[0], formatStr).slice(0, endIndex);
    const currentEnd = formatDate(dates[1], formatStr).slice(0, endIndex);
    const start = formatDate(startOfDay(new Date()), formatStr).slice(0, endIndex);
    const end = formatDate(new Date(), formatStr).slice(0, endIndex);
    flag = currentStart == start && currentEnd == end;
    console.log(
      '--------------------判断时间段是否是今天----------------------',
      start,
      currentStart,
      currentEnd,
      end,
      flag,
    );
  }
  return flag;
};

/**
 * 判断时间段是否是昨天
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsYesterday = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const yesStart = formatDate(dates[0], formatStr);
    const yesEnd = formatDate(dates[1], formatStr);
    const start = formatDate(startOfDay(subDays(new Date(), 1)), formatStr);
    const end = formatDate(endOfDay(subDays(new Date(), 1)), formatStr);
    flag = yesStart == start && yesEnd == end;
    console.log('--------------------判断时间段是否是昨天----------------------', start, yesStart, yesEnd, end, flag);
  }
  return flag;
};

/**
 * 判断时间段是否是本周
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsThisWeek = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const endIndex = timeUnit === TIME_UNITS.MINUTES ? -1 : 999;
    const yesStart = formatDate(dates[0], formatStr).slice(0, endIndex);
    const yesEnd = formatDate(dates[1], formatStr).slice(0, endIndex);
    const start = formatDate(startOfISOWeek(new Date()), formatStr).slice(0, endIndex);
    const end = formatDate(new Date(), formatStr).slice(0, endIndex);
    flag = yesStart == start && yesEnd == end;
    console.log('--------------------判断时间段是否是本周----------------------', start, yesStart, yesEnd, end, flag);
  }
  return flag;
};

/**
 * 判断时间段是否是上周
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsLastWeek = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const endIndex = timeUnit === TIME_UNITS.MINUTES ? -1 : 999;
    const yesStart = formatDate(dates[0], formatStr).slice(0, endIndex);
    const yesEnd = formatDate(dates[1], formatStr).slice(0, endIndex);
    const start = formatDate(startOfISOWeek(subWeeks(new Date(), 1)), formatStr).slice(0, endIndex);
    const end = formatDate(endOfISOWeek(subWeeks(new Date(), 1)), formatStr).slice(0, endIndex);
    flag = yesStart == start && yesEnd == end;
    console.log('--------------------判断时间段是否是上周----------------------', start, yesStart, yesEnd, end, flag);
  }
  return flag;
};

/**
 * 判断时间段是否是本月
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsThisMonth = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const endIndex = timeUnit === TIME_UNITS.MINUTES ? -1 : 999;
    const yesStart = formatDate(dates[0], formatStr).slice(0, endIndex);
    const yesEnd = formatDate(dates[1], formatStr).slice(0, endIndex);
    const start = formatDate(startOfMonth(new Date()), formatStr).slice(0, endIndex);
    const end = formatDate(new Date(), formatStr).slice(0, endIndex);
    flag = yesStart == start && yesEnd == end;
    console.log('--------------------判断时间段是否是本月----------------------', start, yesStart, yesEnd, end, flag);
  }
  return flag;
};

/**
 * 判断时间段是否是上月
 * @param dates 时间段
 * @param timeUnit 颗粒度
 * @returns {boolean}
 */
export const mapDateScopeIsLastMonth = (dates: Date[], timeUnit: string): boolean => {
  let flag = false;
  if (dates && dates.length > 0) {
    const formatStr = mapFormatByTimeUnit(timeUnit);
    const endIndex = timeUnit === TIME_UNITS.MINUTES ? -1 : 999;
    const yesStart = formatDate(dates[0], formatStr).slice(0, endIndex);
    const yesEnd = formatDate(dates[1], formatStr).slice(0, endIndex);
    const start = formatDate(startOfMonth(subMonths(new Date(), 1)), formatStr).slice(0, endIndex);
    const end = formatDate(endOfMonth(subMonths(new Date(), 1)), formatStr).slice(0, endIndex);
    flag = yesStart == start && yesEnd == end;
    console.log('--------------------判断时间段是否是上月----------------------', start, yesStart, yesEnd, end, flag);
  }
  return flag;
};

/**
 * 根据颗粒度&快捷选时类型返回时间范围
 * @param timeUnit
 * @param quickTimingType
 * @returns
 */
export const mapDateScopeByQuickTimingType = (quickTimingType: string) => {
  console.log(quickTimingType);
  let date: Date[] = [];
  switch (quickTimingType) {
    case Common_EQuickTimingType.今日:
      date = [startOfDay(new Date()), new Date()];
      break;
    case Common_EQuickTimingType.昨天:
      date = [startOfDay(subDays(new Date(), 1)), endOfDay(subDays(new Date(), 1))];
      break;
    case Common_EQuickTimingType.本周:
      date = [startOfISOWeek(new Date()), new Date()];
      break;
    case Common_EQuickTimingType.上周:
      date = [startOfISOWeek(subWeeks(new Date(), 1)), endOfISOWeek(subWeeks(new Date(), 1))];
      break;
    case Common_EQuickTimingType.本月:
      date = [startOfMonth(new Date()), new Date()];
      break;
    case Common_EQuickTimingType.上月:
      date = [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))];
      break;
  }
  return date;
};
