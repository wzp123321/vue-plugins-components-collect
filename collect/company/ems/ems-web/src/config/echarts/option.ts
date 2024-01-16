import { themeConstant, echartsConstant } from './constant';
import { formatter } from '@/config/echarts/utils';

/**
 * 通用配置
 */
export const echartsOption = (theme: string): GlobalModule.CommonObject => {
  const {
    CHARTS_AXIS_TEXT_COLOR,
    CHARTS_AXIS_LINE_COLOR,
    CHARTS_SPLIT_LINE_COLOR,
    CHARTS_TOOLTIP_BG_COLOR,
    CHARTS_TOOLTIP_TEXT_COLOR,
  } = themeConstant[theme];
  return {
    // line tooltips公共配置
    ECHARTS_LINECHART_TOOLTIP_OPTION: {
      trigger: 'axis',
      transitionDuration: 0.001,
      backgroundColor: CHARTS_TOOLTIP_BG_COLOR,
      padding: echartsConstant.CHARTS_TOOLTIP_PADDING,
      shadowColor: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
      shadowOffsetX: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
      shadowOffsetY: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
      textStyle: {
        color: CHARTS_TOOLTIP_TEXT_COLOR,
        align: 'left',
      },
      confine: true,
      axisPointer: {
        type: 'line',
        snap: true,
        animation: false,
        lineStyle: {
          type: 'solid',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.01)', // 0% 处的颜色
              },
              {
                offset: 0,
                color: '#1890ff', // 100% 处的颜色
              },
            ],
            global: false, // 缺省为 false
          },
        },
      },
      position: (
        pos: GlobalModule.CommonObject,
        params: GlobalModule.CommonObject,
        dom: HTMLElement,
        rect: string,
        size: GlobalModule.CommonObject,
      ) => {
        const obj = [];
        if (size.viewSize[0] - (pos[0] + size.contentSize[0] + 30) > 0) {
          obj.push(pos[0] + 30);
        } else {
          obj.push(pos[0] - (size.contentSize[0] + 30));
        }
        obj.push('10%');
        return obj;
      },
    },
    // tooltip配置
    ECHARTS_TOOLTIP_OPTION: {
      backgroundColor: CHARTS_TOOLTIP_BG_COLOR,
      padding: echartsConstant.CHARTS_TOOLTIP_PADDING,
      shadowColor: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
      shadowOffsetX: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
      shadowOffsetY: echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
      textStyle: {
        color: CHARTS_TOOLTIP_TEXT_COLOR,
        align: 'left',
      },
      // 鼠标悬浮时 垂直线条
      axisPointer: {
        type: 'line',
        axis: 'x',
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 1)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0)' },
            ],
          },
          width: 1,
          type: 'solid',
        },
      },
    },
    // grid
    ECHARTS_COMMON_GRID_OPTION: {
      left: '1%',
      right: '4%',
      containLabel: true,
    },
    // line category axis
    ECHARTS_LINECHART_AXIS_CATEGORY_OPTION: {
      type: 'category',
      nameTextStyle: {
        color: CHARTS_AXIS_TEXT_COLOR,
        fontSize: 14,
        padding: [46, 0, 0, 0],
      },
      axisLine: {
        lineStyle: {
          color: CHARTS_AXIS_LINE_COLOR,
        },
      },
      // 轴文本
      axisLabel: {
        color: CHARTS_AXIS_TEXT_COLOR,
        margin: 16,
        fontSize: 14,
      },
      // 刻度
      axisTick: {
        show: false,
      },
      // 分割线
      splitLine: {
        lineStyle: {
          color: CHARTS_SPLIT_LINE_COLOR,
        },
      },
    },
    // echarts value axis
    ECHARTS_LINECHART_AXIS_VALUE_OPTION: {
      type: 'value',
      offset: 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: CHARTS_AXIS_LINE_COLOR,
        },
      },
      axisTick: {
        lineStyle: {
          color: CHARTS_AXIS_TEXT_COLOR,
        },
        length: 2,
      },
      axisLabel: {
        color: CHARTS_AXIS_TEXT_COLOR,
        fontSize: echartsConstant.CHARTS_FONT_SIZE_14,
        lineHeight: 22,
        formatter,
      },
      splitLine: {
        show: true,
      },
      boundaryGap: [0, 0.01],
    },
    // legend基本配置
    ECHARTS_LINECHART_LEGEND_OPTION: {
      icon: 'rect',
      itemWidth: 20,
      itemHeight: 2,
      pageIconColor: echartsConstant.CHARTS_LEGEND_ICON_ACTIVE_COLOR, // icon颜色
      pageIconInactiveColor: echartsConstant.CHARTS_AXIS_TEXT_COLOR, // 高亮icon颜色
      pageTextStyle: {
        color: CHARTS_AXIS_TEXT_COLOR,
      },
      textStyle: {
        fontSize: 14,
        color: CHARTS_AXIS_TEXT_COLOR,
      },
    },
  };
};
