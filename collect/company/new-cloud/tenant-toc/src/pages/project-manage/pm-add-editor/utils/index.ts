import { Common_IValueLabel } from '@/service/api';
import { convertToChinaNum } from '@/utils';
import { differenceInMonths } from 'date-fns';
import { PM_IContractPriceAdjust, PM_IContractShareModel } from '../pm-add-editor.api';
import { isEqual } from 'lodash';
import { PM_EPriceAdjustmentType, PM_EPriceType } from '../../constant/enum';

/**
 * 将时间范围按托管期
 * @param dateList
 * @param firstMonth
 * @returns
 */
export const mapPeriodListByScope = (dateList: Date[], firstMonth: string): Common_IValueLabel<number>[] => {
  if (!dateList || !dateList?.length) {
    return [];
  }
  const month = firstMonth === '' ? 12 : Number(firstMonth);
  const differenceMonths = differenceInMonths(dateList?.[1], dateList?.[0]) + 1;
  const list: Common_IValueLabel<number>[] = [];
  let value = 1;
  if (month < differenceMonths) {
    value += Math.ceil((differenceMonths - month) / 12);
  }
  for (let k = 1; k <= value; k++) {
    list.push({
      value: k,
      label: `第${convertToChinaNum(k)}托管期`,
    });
  }

  return list;
};

/**
 * 校验是否存在
 * @param value
 * @param list
 */
export const checkExist = (value: number | null | string, list: number[]): number | null => {
  return value === '' || value === null || !list.includes(Number(value)) ? null : Number(value);
};
/**
 * 枚举转数组
 * @param params
 */
export const mapEnumToArray = (params: any): number[] => {
  return (Object.values(params) as any)?.filter((item: any) => typeof item !== 'string');
};

/**
 * 对比前后收益分享模式数据是否变化
 * @returns {boolean} true代表变化了
 */
export const checkShareModeChange = (list: PM_IContractShareModel[], originList: PM_IContractShareModel[]): boolean => {
  console.log('对比前后收益分享模式数据是否变化------------', list, originList, !isEqual(list, originList));
  return !isEqual(list, originList);
};

/**
 * 对比前后单价调差方式是否变化
 * 根据不同条件展示字段，处理成对应对象
 * @returns {boolean} true代表变化了
 */
export const checkPriceAdjustTypeChange = (
  list: PM_IContractPriceAdjust[],
  originList: PM_IContractPriceAdjust[],
): boolean => {
  const convertList = (arr: PM_IContractPriceAdjust[]) => {
    const newArr: any = [];
    arr.forEach((item) => {
      const {
        adjustCardinalityType,
        adjustTimeType,
        adjustType,
        customPrice,
        decimalPoint,
        energyCode,
        lower,
        priceType,
        upper,
      } = item;
      let obj: any = { energyCode, adjustType };
      if (adjustType !== PM_EPriceAdjustmentType.无限风险) {
        obj = {
          ...obj,
          adjustTimeType,
          adjustCardinalityType,
          priceType,
        };
        if (adjustType !== PM_EPriceAdjustmentType.变动实时调整) {
          obj = {
            ...obj,
            lower,
            upper,
          };
        }
        if (priceType !== PM_EPriceType.自定义单价) {
          obj = {
            ...obj,
            decimalPoint,
          };
        } else {
          obj = {
            ...obj,
            customPrice,
          };
        }
      }
      newArr.push(obj);
    });
    return newArr;
  };
  const newList = convertList(list);
  const newOriginList = convertList(originList);
  console.log('对比前后单价调差方式数据是否变化------------', newList, newOriginList, !isEqual(newList, newOriginList));
  return !isEqual(newList, newOriginList);
};
