import { CommonTimeUnit } from '@/services/common.api';
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
  return timeUnit === CommonTimeUnit.MINUTES
    ? 'YYYY-MM-DD HH:mm'
    : timeUnit === CommonTimeUnit.HOUR
    ? 'YYYY-MM-DD HH:mm'
    : timeUnit === CommonTimeUnit.DAY
    ? 'YYYY-MM-DD'
    : timeUnit === CommonTimeUnit.MONTH
    ? 'YYYY-MM'
    : 'YYYY';
};

// 格式
export const mapPickerSmallFormatByTimeUnit = (timeUnit: string) => {
  return timeUnit === CommonTimeUnit.MINUTES
    ? 'yyyy-MM-dd HH:mm'
    : timeUnit === CommonTimeUnit.HOUR
    ? 'yyyy-MM-dd HH:mm'
    : timeUnit === CommonTimeUnit.DAY
    ? 'yyyy-MM-dd'
    : timeUnit === CommonTimeUnit.MONTH
    ? 'yyyy-MM'
    : 'yyyy';
};
