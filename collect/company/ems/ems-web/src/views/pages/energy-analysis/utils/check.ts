import { isToday, isThisMonth, isThisYear } from 'date-fns';

export interface ITHCompareVO {
  tbFlag: boolean;
  hbFlag: boolean;
}

/**
 * @Author: zpwan
 * @Date: 2022-10-12 15:07:10
 * @Last Modified by: zpwan
 * @Last Modified time: 2023-04-27 18:47:03
 *
 * 10m，1h
 *  没有同环比
 * 1d：
 *  1.包含当天 如 2022.10.11-2022.10.12 没有同环比，
 *  2.不包含当天&跨月不跨年如 2022.09.28-2022.10.01 只有同比没有环比
 *  3.跨年 如 2021.11.11-2022.09.09 没有同环比
 *  4.非钻取情况，查询时间只有当天的没有同环比
 * 1M：
 *  1.包含当月 如2022.09-2022.10 没有同环比
 *  2.不包含当月&跨年 如 2021.11-2022.09 没有同环比
 *  3.非钻取情况，查询时间只有当月的没有同环比
 * 1y：
 *  1.没有环比
 *  2.钻取情况，查询时间包含当年的没有同比
 *  3.非钻取情况，查询时间只有当年的没有同比
 *
 * @param timeUnit 时间颗粒度  10m  1h  1d  1M  1y
 * @param dateArr 时间范围
 * @param drillFlag 是否是钻取
 */
export const checkHasTHCompare = (timeUnit: string, dateArr: string[], drillFlag: boolean = true): ITHCompareVO => {
  const startTime = new Date(dateArr?.[0]);
  const endTime = new Date(dateArr?.[1]);
  const compareVO: ITHCompareVO = {
    tbFlag: true,
    hbFlag: true,
  };
  if (!dateArr || dateArr?.length === 0) {
    return compareVO;
  }

  switch (String(timeUnit)) {
    case '10m':
    case '1h':
      compareVO.hbFlag = false;
      compareVO.tbFlag = false;
      break;
    case '1d':
      // 如果是钻取
      if (drillFlag) {
        if (isToday(startTime) || isToday(endTime)) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        } else if (
          startTime?.getMonth() !== endTime?.getMonth() &&
          startTime?.getFullYear() === endTime?.getFullYear()
        ) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = true;
        } else if (startTime?.getFullYear() !== endTime?.getFullYear()) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        }
      } else {
        // 非钻取情况下，只有当天则没有同环比
        if (isToday(startTime)) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        }
      }

      break;
    case '1M':
      // 如果是钻取
      if (drillFlag) {
        if (isThisMonth(startTime) || isThisMonth(endTime)) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        } else if (startTime?.getFullYear() !== endTime?.getFullYear()) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        }
      } else {
        // 非钻取情况下，只有当月则没有同环比
        if (isThisMonth(startTime)) {
          compareVO.hbFlag = false;
          compareVO.tbFlag = false;
        }
      }
      break;
    case '1y':
      // 如果是钻取
      if (drillFlag) {
        if (isThisYear(startTime) || isThisYear(endTime)) {
          compareVO.tbFlag = false;
        } else if (startTime?.getFullYear() !== endTime?.getFullYear()) {
          compareVO.tbFlag = false;
        }
      } else {
        if (isThisYear(startTime)) {
          compareVO.tbFlag = false;
        }
      }
      compareVO.hbFlag = false;
      break;
    default:
      compareVO.hbFlag = false;
      compareVO.tbFlag = false;
      break;
  }
  return compareVO;
};
