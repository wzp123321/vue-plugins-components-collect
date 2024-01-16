import type { Common_ITHCompareVO } from '@/api/model';
import { Common_ETimeUnit } from '@/config/enum';
import { checkHasTHCompare } from '@/utils';
import { reactive } from 'vue';

/**
 * 处理同环比
 * @returns
 */
export const useThCompareController = () => {
  // 总数据同环比
  const tbCompare = reactive<Common_ITHCompareVO>({
    tbFlag: false,
    hbFlag: false,
  });
  // 总数据同环比
  const chartTbCompare = reactive<Common_ITHCompareVO>({
    tbFlag: false,
    hbFlag: false,
  });
  /**
   * 处理同环比
   * @param timeUnit
   * @param date
   */
  const mapTbCompare = (timeUnit: string, date: string) => {
    const th = checkHasTHCompare(timeUnit, date);
    tbCompare.tbFlag = th.tbFlag;
    tbCompare.hbFlag = th.hbFlag;

    if ([Common_ETimeUnit.年 + '', Common_ETimeUnit.月].includes(timeUnit)) {
      const chartTh = checkHasTHCompare(
        timeUnit === Common_ETimeUnit.年 + '' ? Common_ETimeUnit.月 : Common_ETimeUnit.日,
        date,
      );
      chartTbCompare.tbFlag = chartTh.tbFlag;
      chartTbCompare.hbFlag = chartTh.hbFlag;
    } else {
      chartTbCompare.hbFlag = false;
      chartTbCompare.tbFlag = false;
    }
  };

  return {
    tbCompare,
    chartTbCompare,
    mapTbCompare,
  };
};
