import { thousandSeparation } from '@/utils/index';
import EchartsConfig from '@/config/echarts/index';
import store from '@/store';
import { Eca_EWarningStatus } from '@/config/enum';

import esaNormalBg from '../../../../assets/img/energy-conservation-assess/ec-surplus-bg.svg';
import esaWarningBg from '../../../../assets/img/energy-conservation-assess/ec-alert-bg.svg';
import esaOverspentBg from '../../../../assets/img/energy-conservation-assess/ec-over-budget-bg.svg';
/**
 * 处理tooltips
 * @param colors 颜色数组
 * @param unit 单位
 * @returns
 */
export const formatTooltipUtils = (
  colors: string[],
  unit: string,
  year: number,
  type: number,
  xaxisData: string[],
): GlobalModule.CommonObject => {
  const formatter = (params: any) => {
    let innerHtml = '';
    const dataIndex = params[0].dataIndex;
    const title = adaptChartTooltipDate(year, xaxisData[dataIndex]);
    params.forEach((item: GlobalModule.CommonObject, index: number) => {
      //剩余值或剩余值为null,tooltip不显示
      if (
        (item.seriesName.trim() !== '剩余值' && item.seriesName.trim() !== '剩余值（负）') ||
        ((item.seriesName.trim() === '剩余值' || item.seriesName.trim() === '剩余值（负）') &&
          Object.prototype.toString.call(item.value) !== '[object Null]' &&
          Object.prototype.toString.call(item.value) !== '[object Undefined]')
      )
        innerHtml += `
        <div style="margin-top: 4px"><span><span style="height:8px;width:8px;display:inline-block;margin-right: 8px;
        border:1px solid #fff;background-color:${colors[item.componentIndex]}"></span>${item.seriesName}：</span><span>
          ${
            Object.prototype.toString.call(item.value) === '[object Null]' ||
            Object.prototype.toString.call(item.value) === '[object Undefined]'
              ? '--'
              : thousandSeparation(item.value)
          }
          ${
            Object.prototype.toString.call(item.value) === '[object Null]' ||
            Object.prototype.toString.call(item.value) === '[object Undefined]'
              ? ''
              : unit
          }
          </span></div>`;
    });
    return params.length > 0
      ? `<div style="color: #fff;padding:4px 6px">
              <div>${type === 1 ? `${year}-${params[0].axisValue?.replace('.', '-')}` : title}</div>
              <div>${innerHtml}</div>
              </div>`
      : '';
  };

  return Object.assign(
    { formatter },
    EchartsConfig.echartsOption(store.getters.theme).ECHARTS_LINECHART_TOOLTIP_OPTION,
  );
};

// 根据年 数据 获取tooltip标题
const adaptChartTooltipDate = (selectYear: number, xAxisDateStr: string) => {
  const endDate = `${selectYear}.${xAxisDateStr}`;
  const monthMap = {
    year: '01',
    month: xAxisDateStr.split('.')[0],
  };
  const dayMap = {
    year: '',
    month: '.01',
  };
  const quotaType = xAxisDateStr.includes('.') ? 'month' : 'year';
  const startDate = `${selectYear}.${monthMap[quotaType]}${dayMap[quotaType]}`;
  return `${startDate}-${endDate}`;
};

/**
 * 根据状态取不同的背景图和类名
 * @param status
 * @returns
 */
export const mapEcaAssessItemStatusObj = (status: Eca_EWarningStatus): { bg: string; className: string } => {
  let statusObj = {
    bg: '',
    className: '',
  };
  switch (status) {
    case Eca_EWarningStatus.盈余:
      statusObj = {
        bg: esaNormalBg,
        className: 'normal',
      };
      break;
    case Eca_EWarningStatus.警告:
      statusObj = {
        bg: esaWarningBg,
        className: 'warn',
      };
      break;
    case Eca_EWarningStatus.超标:
      statusObj = {
        bg: esaOverspentBg,
        className: 'over',
      };
      break;
    default:
      statusObj = {
        bg: esaNormalBg,
        className: 'normal',
      };
      break;
  }
  return statusObj;
};
