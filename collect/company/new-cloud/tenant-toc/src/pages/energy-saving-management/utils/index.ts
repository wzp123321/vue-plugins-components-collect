import { floatMultiply } from '../../../utils/index';
/**
 * 处理百分比
 * @param value
 */
export const mapPercent = (value: number | null) => {
  return value === null ? '-' : `${floatMultiply(100, value)}%`;
};
