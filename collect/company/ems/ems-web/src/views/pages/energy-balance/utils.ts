// utils
import { isToday } from 'date-fns';
import { formatDate } from '@/utils/index';

// 生成样式、事件
const iconStateStyles = {};
const iconEvents = {};
const iconTypes = ['negative', 'difference', 'increase', 'decrease', 'unauthorized'];
iconTypes.forEach(ele => {
  iconStateStyles[`mouseover:${ele}`] = {
    [`icon-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`icon-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, .65)',
    },
    [`icon-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  iconEvents[`icon-${ele}-bg:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}-bg:mouseout`] = 'onMouseout';
  iconEvents[`icon-${ele}:mouseout`] = 'onMouseout';
});
const textStateStyles = {};
const textEvents = {};
const textTypes = ['title', 'value1', 'value2', 'mark1', 'mark2'];
textTypes.forEach(ele => {
  textStateStyles[`mouseover:${ele}`] = {
    [`text-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`text-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, 0.65)',
    },
    [`text-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  textEvents[`text-${ele}:mouseover`] = 'onMouseover';
  textEvents[`text-${ele}:mouseout`] = 'onMouseout';
});

/**
 * 处理请求参数
 * @param params
 * @returns
 */
export const calculateQueryParams = (params: EnergyBalanceModule.PageFormParams) => {
  const { date, treeType, energyCode, treeId } = params;
  const endTime = isToday(date[1])
    ? formatDate(new Date(), 'yyyy-MM-dd HH:mm')
    : `${formatDate(date[1], 'yyyy-MM-dd')} 23:59`;
  const queryParams = {
    treeType,
    energyCode: energyCode[0],
    startTime: `${formatDate(date[0], 'yyyy-MM-dd')} 00:00`,
    endTime,
  };
  if (treeId && treeId > 0) {
    Object.assign(queryParams, { treeId });
  }
  return queryParams;
};

export default {
  iconStateStyles,
  iconEvents,
  textStateStyles,
  textEvents,
};
