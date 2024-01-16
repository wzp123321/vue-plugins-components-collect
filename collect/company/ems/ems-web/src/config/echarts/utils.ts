import { format } from 'echarts';
/**
 * echarts工具函数模块
 */
export const echartsUtils = {
  /**
   * 折线图 鼠标悬浮拐点
   * @param color 颜色
   * @returns
   */
  resetLineChartSeriesEmphasisItemStyle(color: string, scale: boolean = false): GlobalModule.CommonObject {
    const itemStyle = {
      color: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.5,
        colorStops: [
          {
            offset: 0,
            color: '#FFFFFF',
          },
          {
            offset: 0.2,
            color: '#FFFFFF',
          },
          {
            offset: 0.3,
            color,
          },
          {
            offset: 0.4,
            color,
          },
          {
            offset: 0.5,
            color: '#fff',
          },
          {
            offset: 0.6,
            color: '#fff',
          },
          {
            offset: 0.7,
            color: '#fff',
          },
          {
            offset: 1,
            color,
          },
        ],
        globalCoord: false, // 缺省为 false
      },
    };
    const emphasis = {
      scale,
      itemStyle,
      lineStyle: {
        width: 2,
      },
    };
    return {
      emphasis,
    };
  },
  /**
   * 重置name 为name后面添加后缀避免出现同样的name
   * @param count 次数
   * @param name
   * @returns
   */
  resetName(count: number, name: string) {
    let resetName = name;
    for (let i = 0; i < count; i++) {
      resetName += '\uFEFF';
    }
    return resetName;
  },
  /**
   * 格式化
   * @param value
   * @returns
   */
  formatter(value: string) {
    if (Math.abs(Number(value)) >= 1000 && Math.abs(Number(value)) < 1000000) {
      value = `${(Number(value) / 1000).toFixed(0)}k`;
    } else if (Math.abs(Number(value)) >= 1000000) {
      value = `${(Number(value) / 1000000).toFixed(0)}M`;
    }
    return value;
  },
  /**
   * get series style of dashed line chart
   * @param seriesDatum data
   * @param color custom dashed line color
   */
  getCommonDashedLineSeriesStyleOption(seriesDatum: GlobalModule.CommonObject, color: string) {
    const isSingleData: boolean = seriesDatum.data.length <= 1;
    const symbol = isSingleData ? 'circle' : 'none';
    const showSymbol = isSingleData;
    const itemStyle = isSingleData
      ? {
          normal: {
            color,
          },
        }
      : {
          normal: {
            color,
            lineStyle: {
              color,
              type: 'dashed',
            },
          },
        };

    return {
      name: seriesDatum.name,
      data: seriesDatum.data,
      type: 'line',
      symbol,
      showSymbol,
      smooth: false,
      itemStyle,
      cursor: 'default',
    };
  },
  /**
   * 是否显示点
   */
  getDataIsShowDot(data: string[] | number[], color: string) {
    if (data && data.length && data.length > 0) {
      let arrItem = {};
      const arrData: GlobalModule.CommonObject[] = [];
      data.forEach((item: any, index: number) => {
        if (
          index === 0 &&
          item !== '--' &&
          Object.prototype.toString.call(item) !== '[object Null]' &&
          ((data.length > 1 && (data[1] === '--' || Object.prototype.toString.call(data[1]) === '[object Null]')) ||
            data.length === 1)
        ) {
          arrItem = {
            value: item,
            itemStyle: {
              color,
            },
          };
          arrData.push(arrItem);
        } else if (
          item !== '--' &&
          Object.prototype.toString.call(item) !== '[object Null]' &&
          data.length > 1 &&
          index === data.length - 1 &&
          (data[data.length - 2] === '--' || Object.prototype.toString.call(data[data.length - 2]) === '[object Null]')
        ) {
          arrItem = {
            value: item,
            itemStyle: {
              color,
            },
          };
          arrData.push(arrItem);
        } else if (
          item !== '--' &&
          Object.prototype.toString.call(item) !== '[object Null]' &&
          (Object.prototype.toString.call(data[index - 1]) === '[object Null]' || data[index - 1] === '--') &&
          (Object.prototype.toString.call(data[index + 1]) === '[object Null]' || data[index + 1] === '--')
        ) {
          arrItem = {
            value: item,
            itemStyle: {
              color,
            },
          };
          arrData.push(arrItem);
        } else {
          arrItem = {
            value: item,
            itemStyle: {
              color: 'transparent',
            },
          };
          arrData.push(arrItem);
        }
      });
      return arrData;
    } else {
      return data;
    }
  },
  // 获取symbolStyle
  getsymbolStyle(color: string) {
    return {
      color: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.5,
        colorStops: [
          {
            offset: 0,
            color: '#FFFFFF',
          },
          {
            offset: 0.2,
            color: '#FFFFFF',
          },
          {
            offset: 0.3,
            color: '#FFFFFF',
          },
          {
            offset: 0.4,
            color,
          },
          {
            offset: 0.5,
            color,
          },
          {
            offset: 0.6,
            color: '#FFFFFF',
          },
          {
            offset: 0.7,
            color: '#FFFFFF',
          },
          {
            offset: 0.8,
            color: '#FFFFFF',
          },
          {
            offset: 0.9,
            color: '#FFFFFF',
          },
          {
            offset: 1,
            color,
          },
        ],
      },
    };
  },
  /**
   * 格式化文本
   * @param name
   * @returns
   */
  formatterText: (name: string) => {
    return format.truncateText(name, 100, '14px Microsoft Yahei', '…', {});
  },
};

/**
 * 格式化横纵轴 -- 处理数字简写
 * @param value
 * @returns
 */
export const formatter = (value: string) => {
  if (Math.abs(Number(value)) >= 1000 && Math.abs(Number(value)) < 1000000) {
    value = `${(Number(value) / 1000).toFixed(0)}k`;
  } else if (Math.abs(Number(value)) >= 1000000) {
    value = `${(Number(value) / 1000000).toFixed(0)}M`;
  }
  return value;
};
