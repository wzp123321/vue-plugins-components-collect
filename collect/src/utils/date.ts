import { ECommonTimeUnit } from '@/services/common.api';
import dayjs from 'dayjs';

/**
 * 日期格式化
 * @param timeStamp
 * @param formatStr
 * @returns
 */
export const formatDate = (timeStamp: number | Date, formatStr: string) => dayjs(timeStamp).format(formatStr);

// 格式
export const mapPickerFormatByTimeUnit = (timeUnit: string): string => {
  if (timeUnit === ECommonTimeUnit.MINUTES) return 'YYYY-MM-DD HH:mm';
  if (timeUnit === ECommonTimeUnit.HOUR) return 'YYYY-MM-DD HH:mm';
  if (timeUnit === ECommonTimeUnit.DAY) return 'YYYY-MM-DD';
  if (timeUnit === ECommonTimeUnit.MONTH) return 'YYYY-MM';
  return 'YYYY';
};

// 格式
export const mapPickerSmallFormatByTimeUnit = (timeUnit: string): string => {
  if (timeUnit === ECommonTimeUnit.MINUTES) return 'yyyy-MM-dd HH:mm';
  if (timeUnit === ECommonTimeUnit.HOUR) return 'yyyy-MM-dd HH:mm';
  if (timeUnit === ECommonTimeUnit.DAY) return 'yyyy-MM-dd';
  if (timeUnit === ECommonTimeUnit.MONTH) return 'yyyy-MM';
  return 'yyyy';
};
