import { ECommonTimeUnit } from '@/services/common.api';
import dayjs from 'dayjs';

/**
 * 日期格式化
 * @param timeStamp
 * @param formatStr
 * @returns
 */
export const formatDate = (timeStamp: number | Date, formatStr: string) => {
  return dayjs(timeStamp).format(formatStr);
};

// 格式
export const mapPickerFormatByTimeUnit = (timeUnit: string) => {
  return timeUnit === ECommonTimeUnit.MINUTES
    ? 'YYYY-MM-DD HH:mm'
    : timeUnit === ECommonTimeUnit.HOUR
      ? 'YYYY-MM-DD HH:mm'
      : timeUnit === ECommonTimeUnit.DAY
        ? 'YYYY-MM-DD'
        : timeUnit === ECommonTimeUnit.MONTH
          ? 'YYYY-MM'
          : 'YYYY';
};

// 格式
export const mapPickerSmallFormatByTimeUnit = (timeUnit: string) => {
  return timeUnit === ECommonTimeUnit.MINUTES
    ? 'yyyy-MM-dd HH:mm'
    : timeUnit === ECommonTimeUnit.HOUR
      ? 'yyyy-MM-dd HH:mm'
      : timeUnit === ECommonTimeUnit.DAY
        ? 'yyyy-MM-dd'
        : timeUnit === ECommonTimeUnit.MONTH
          ? 'yyyy-MM'
          : 'yyyy';
};
