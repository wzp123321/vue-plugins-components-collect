import { addMonths, differenceInDays, isAfter } from 'date-fns';
import { longTaskMonthInterval, shortestDateScope } from './constant';
import { EMiDailyEnergyStandardType, EMiDailyUpperLimitType } from './enum';
import { IMcMonitoringConfigureForm, IMcSelectedPeriodVO } from './api';
import { thousandSeparation } from '@/utils';

/**
 * 判断是否是超长时间任务
 */
export const isLongTimeTask = (startTime: string, endTime: string) => {
  // 计算6个月后的日期
  const sixMonthsLater = addMonths(new Date(startTime), longTaskMonthInterval);
  // 检查第二个日期是否在6个月后的日期之后
  return !!startTime && !!endTime && isAfter(new Date(endTime), sixMonthsLater);
};
/**
 * 判断是否低于30天
 */
export const mapDateScopeTooShort = (startTime: string, endTime: string) => {
  return (
    !!startTime &&
    !!endTime &&
    Math.abs(differenceInDays(new Date(startTime), new Date(endTime))) < shortestDateScope - 1
  );
};

/**
 * 判断是否是日能耗参考的系统推荐
 */
export const mapIsStandardSystemRecommendType = (type: string) => {
  return type === EMiDailyEnergyStandardType.系统推荐;
};
/**
 * 判断是否是日能耗上限的系统推荐
 */
export const mapIsUpperSystemRecommendType = (type: string) => {
  return type === EMiDailyUpperLimitType.系统推荐;
};
/**
 * 根据年份和月份获取该月的天数列表
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns {value: number, label: string} 格式的日期数组
 */
export const getDaysInMonth = (year: string, month: string): Array<{ value: string; label: string }> => {
  const convertYear = Number(year);
  const convertMonth = Number(month);
  // 检查参数有效性
  if (convertMonth < 1 || convertMonth > 12) {
    return [];
  }

  // 获取当月最后一天的日期（即当月天数）
  let lastDay = new Date(convertYear, convertMonth, 0).getDate();
  // 2月特殊处理成29
  if (convertMonth === 2) {
    lastDay = 29;
  }
  // 生成天数数组
  const days = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push({
      value: day > 9 ? String(day) : `0${day}`,
      label: `${day}日`,
    });
  }

  return days;
};

export const getDataIsShowDot = (data: (string | null)[], color: string, groupName: string) => {
  if (data && data.length && data.length > 0) {
    let arrItem = {};
    const arrData: any[] = [];
    data.forEach((item: any, index: number) => {
      if (
        index === 0 &&
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        ((data.length > 1 && (data[1] === '--' || Object.prototype.toString.call(data[1]) === '[object Null]')) ||
          data.length === 1)
      ) {
        arrItem = {
          value: item,
          groupName,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else if (
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        data.length > 1 &&
        index === data.length - 1 &&
        (data[data.length - 2] === '--' || Object.prototype.toString.call(data[data.length - 2]) === '[object Null]')
      ) {
        arrItem = {
          value: item,
          groupName,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else if (
        item !== '--' &&
        Object.prototype.toString.call(item) !== '[object Null]' &&
        (Object.prototype.toString.call(data[index - 1]) === '[object Null]' || data[index - 1] === '--') &&
        (Object.prototype.toString.call(data[index + 1]) === '[object Null]' || data[index + 1] === '--')
      ) {
        arrItem = {
          value: item,
          groupName,
          itemStyle: {
            color,
          },
        };
        arrData.push(arrItem);
      } else {
        arrItem = {
          value: item,
          groupName,
          itemStyle: {
            color: 'transparent',
          },
        };
        arrData.push(arrItem);
      }
    });
    return arrData;
  } else {
    return data;
  }
};

/**
 * 检查日期是否在范围内
 * @param date
 * @param startDate
 * @param endDate
 * @returns
 */
export const isDateInRange = (
  date: IMcSelectedPeriodVO,
  startDate: IMcSelectedPeriodVO,
  endDate: IMcSelectedPeriodVO,
) => {
  console.log('date----------', date, startDate, endDate);
  // 转换为数字便于比较 (month * 100 + day)
  const dateNum = date.month * 100 + date.day;
  const startNum = startDate.month * 100 + startDate.day;
  const endNum = endDate.month * 100 + endDate.day;

  return dateNum >= startNum && dateNum <= endNum;
};
/**
 * 判断是否为空
 * @param value
 * @returns
 */
export const mapIsEmpty = (value: string) => {
  return value === '' || value === null;
};
/**
 * 处理异常数据
 * @param value
 * @returns
 */
export const mapEmptyValue = (value: string) => {
  return value !== '' && value !== null ? thousandSeparation(Number(value)) : '-';
};
/**
 * 找到配置不全的时段
 */
export const findNotConfiguredPeriod = (list: IMcMonitoringConfigureForm[]) => {
  let index = -1;
  if (list?.length > 0) {
    index = list.findIndex((item) => {
      const {
        benchPolicy,
        benchWorkdayValue,
        benchHolidayValue,
        upperPolicy,
        upperHolidayValue,
        upperWorkdayValue,
        specialConfig,
      } = item.policyInfo;
      if (
        benchPolicy !== EMiDailyEnergyStandardType.无 &&
        (mapIsEmpty(benchWorkdayValue) || mapIsEmpty(benchHolidayValue))
      ) {
        return true;
      }
      if (
        (upperPolicy === EMiDailyUpperLimitType.固定值 || upperPolicy === EMiDailyUpperLimitType.系统推荐) &&
        (mapIsEmpty(upperWorkdayValue) || mapIsEmpty(upperHolidayValue))
      ) {
        return true;
      }
      if (upperPolicy === EMiDailyUpperLimitType.参考值上浮比例 && mapIsEmpty(specialConfig)) {
        return true;
      }
      return false;
    });
  }
  return index;
};

// 获取symbolStyle
export const getsymbolStyle = (color: string): any => {
  return {
    color: {
      type: 'radial',
      x: 0.5,
      y: 0.5,
      r: 0.5,
      colorStops: [
        {
          offset: 0,
          color: '#FFFFFF',
        },
        {
          offset: 0.2,
          color: '#FFFFFF',
        },
        {
          offset: 0.3,
          color: '#FFFFFF',
        },
        {
          offset: 0.4,
          color,
        },
        {
          offset: 0.5,
          color,
        },
        {
          offset: 0.6,
          color: '#FFFFFF',
        },
        {
          offset: 0.7,
          color: '#FFFFFF',
        },
        {
          offset: 0.8,
          color: '#FFFFFF',
        },
        {
          offset: 0.9,
          color: '#FFFFFF',
        },
        {
          offset: 1,
          color,
        },
      ],
    },
  };
};
