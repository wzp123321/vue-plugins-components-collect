/*
 * @Description: 告警曲线服务
 * @Author: zpwan
 * @Date: 2022-05-26 10:14:51
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-05-27 10:59:11
 */
import { ref } from 'vue';

import { init, EChartsType, EChartsOption, XAXisComponentOption, MarkPointComponentOption } from 'echarts';

import { formatDate } from '@/utils/index';

const DANGER_COLOR = 'rgba(247, 75, 68, 1)'; // 越限颜色
const DANGER_SHADOW_COLOR = '#fcbcc0'; // 高亮浅色
const NORMAL_COLOR = 'rgba(24, 144, 255, 1)'; // 未越限颜色
const NORMAL_SHADOW_COLOR = '#b7dcff'; // 未越限浅色
const TEXT_PRIMARY_COLOR = 'rgba(0, 0, 0, 0.65)'; // 正常文本色
const TEXT_SECOND_PRIMARY_COLOR = 'rgba(0, 0, 0, 0.45)'; // 浅色文本
const XIAS_LINE_COLOR = 'rgba(216, 216, 216, 1)'; // 轴线颜色

// 自定义参数
const alarmVO = {
  data: [100, 204, 320, 220, 190, 101, 90, 333, 240, 40, 223, 356, 567, 423, 232, 444, 22, 345],
  xaxis: [
    1653552621839, 1653553621839, 1653554621839, 1653555621839, 1653556621839, 1653557621839, 1653558621839,
    1653559621839, 1653560621839, 1653561621839, 1653562621839, 1653563621839, 1653564621839, 1653565621839,
    1653566621839, 1653536621839, 1653576621839, 1653586621839,
  ],
  thresholdValue: 200, // 阈值
  peakValue: 320, // 峰值
  outOfLimitValue: 356, // 越限值
};

class AlarmChartService<T> {
  //#region
  private _is_init = ref<boolean>(false);
  private _dataSource = ref<T>();
  private _customChartId = ref<string>('');
  private echartsInstance?: EChartsType;
  //#endregion
  //#region
  public get customChartId(): string {
    return this._customChartId.value;
  }
  constructor(params: T) {
    this._customChartId.value = `charts_${(Math.random() * 10000).toFixed(0)}`;
    this._is_init.value = true;
    this._dataSource.value = params;
  }
  //#region 初始化
  initChart() {
    if (!this._is_init.value) {
      console.warn('请先初始化服务！');
      return;
    }
    const containerEle = document.getElementById(this._customChartId.value);
    if (!containerEle) {
      console.warn('加载图表容器错误！');
      return;
    }
    this.echartsInstance = init(containerEle);
    const options = this.getEchartsOptions();
    this.echartsInstance.setOption(options);
  }
  //#endregion
  //#region 获取echarts配置
  getEchartsOptions(): EChartsOption {
    const unit = 'kWh';
    return {
      title: {
        text: `单位（${unit}）`,
        textStyle: {
          color: TEXT_SECOND_PRIMARY_COLOR,
          fontSize: 14,
        },
        top: 20,
        left: 10,
      },
      tooltip: this.getTooltip(),
      grid: {
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: this.getXaxis(),
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (params: number) => {
            return params === alarmVO.thresholdValue ? '' : params + '';
          },
          color: TEXT_PRIMARY_COLOR,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: XIAS_LINE_COLOR, // 轴线颜色
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: XIAS_LINE_COLOR, // 轴线颜色
          },
        },
        splitLine: {
          show: false,
        },
      },
      visualMap: {
        show: false,
        // 根据值来显示不同颜色
        pieces: [
          {
            gt: 0,
            lte: alarmVO.thresholdValue,
            color: NORMAL_COLOR,
          },
          {
            gt: alarmVO.thresholdValue,
            color: DANGER_COLOR,
          },
        ],
        seriesIndex: 0,
      },
      series: this.getSeries(),
    };
  }
  //#endregion
  //#region tooltip
  getTooltip(): EChartsOption['tooltip'] {
    return {
      trigger: 'axis',
      borderWidth: 0,
      padding: [0],
      formatter(params: any) {
        const value = params[0]?.value;
        const date = Number(params[0]?.axisValue);
        const borderColor = value > alarmVO.thresholdValue ? DANGER_COLOR : NORMAL_COLOR;
        const labelColor = TEXT_SECOND_PRIMARY_COLOR;
        const valueColor = TEXT_PRIMARY_COLOR;
        const marginBottom = '8px';
        return `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                    <div style="color: ${labelColor}">越限值</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${value ?? '--'}</div>
                    <div style="color: ${labelColor}">越限时间</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                    ${formatDate(date, 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                    <div style="color: ${labelColor}">阈值</div>
                    <div style="color: ${valueColor};">${alarmVO.thresholdValue}</div>
                </div>`;
      },
      position: (point, params, dom, rect, size) => [
        point[0] + size.contentSize[0] + 40 < size.viewSize[0] ? point[0] + 34 : point[0] - 34 - size.contentSize[0],
        8,
      ],
      // TODO---- 需要根据值 生成不同颜色
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
    };
  }
  //#endregion
  //#region xaxis
  getXaxis(): XAXisComponentOption {
    return {
      type: 'category',
      boundaryGap: false,
      data: alarmVO?.xaxis ?? [],
      axisLabel: {
        show: false, // 不显示文本
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: XIAS_LINE_COLOR, // 轴线颜色
        },
      },
    };
  }
  //#endregion
  //#region series
  getSeries(): EChartsOption['series'] {
    return [
      {
        name: 'alarm',
        type: 'line',
        stack: 'Total',
        emphasis: {
          lineStyle: {
            width: 2,
          },
        },
        itemStyle: {
          borderWidth: 20,
        },
        lineStyle: {
          width: 2,
        },
        symbol: 'circle',
        symbolSize: 16,
        showSymbol: true,
        data: this.getDataIsShowDot(alarmVO.data),
        markPoint: this.getMarkPoint(),
        markLine: {
          symbol: ['none', 'none'],
          data: [
            {
              emphasis: {
                lineStyle: {
                  width: 1,
                },
              },
              yAxis: alarmVO.thresholdValue,
              label: {
                show: true,
                position: 'start',
                color: DANGER_COLOR,
              },
              lineStyle: {
                width: 1,
                color: DANGER_COLOR,
              },
            },
          ],
        },
      },
    ];
  }
  //#endregion
  //#region markpoint
  getMarkPoint(): MarkPointComponentOption {
    const data = [];
    if (
      Object.prototype.toString.call(alarmVO?.outOfLimitValue) !== '[object Null]' &&
      Object.prototype.toString.call(alarmVO?.outOfLimitValue) !== '[object Undefined]' &&
      alarmVO?.data?.length
    ) {
      let xAxis = '';
      alarmVO.data.forEach((item, index) => {
        if (item === alarmVO.outOfLimitValue) {
          xAxis = alarmVO.xaxis[index] + '';
        }
      });
      data.push({
        xAxis,
        yAxis: alarmVO.outOfLimitValue,
        name: '越限值',
        value: '越限值',
        itemStyle: {
          borderWidth: 0,
        },
        label: {
          color: TEXT_PRIMARY_COLOR,
          position: [16, -6],
        },
      });
    }
    if (
      Object.prototype.toString.call(alarmVO?.peakValue) !== '[object Null]' &&
      Object.prototype.toString.call(alarmVO?.peakValue) !== '[object Undefined]' &&
      alarmVO?.data?.length
    ) {
      let xAxis = '';
      alarmVO.data.forEach((item, index) => {
        if (item === alarmVO.peakValue) {
          xAxis = alarmVO.xaxis[index] + '';
        }
      });
      data.push({
        xAxis,
        yAxis: alarmVO.peakValue,
        value: '峰值点',
        name: '峰值点',
        itemStyle: {
          borderWidth: 0,
        },
        label: {
          color: TEXT_PRIMARY_COLOR,
          position: [12, -10],
        },
      });
    }
    return {
      symbolSize: 0, // 容器大小
      data,
    };
  }
  //#region 获取symbolStyle
  getsymbolStyle(color: string, shodowColor: string): any {
    return {
      color: {
        type: 'radial',
        x: 0.5,
        y: 0.5,
        r: 0.5,
        colorStops: [
          {
            offset: 0,
            color,
          },
          {
            offset: 0.2,
            color,
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
            color,
          },
          {
            offset: 0.6,
            color: shodowColor,
          },
          {
            offset: 0.7,
            color: shodowColor,
          },
          {
            offset: 0.8,
            color: shodowColor,
          },
          {
            offset: 0.9,
            color: shodowColor,
          },
          {
            offset: 1,
            color: shodowColor,
          },
        ],
      },
    };
  }
  //#endregion
  //#region 判断是否展示点
  getDataIsShowDot(data: string[] | number[]) {
    if (data && data.length && data.length > 0) {
      let arrItem = {};
      const arrData: any[] = [];
      data.forEach((item: any, index: number) => {
        const color = item > alarmVO.thresholdValue ? DANGER_COLOR : NORMAL_COLOR;
        const shadowColor = item > alarmVO.thresholdValue ? DANGER_SHADOW_COLOR : NORMAL_SHADOW_COLOR;
        if (
          index === 0 &&
          item !== '--' &&
          Object.prototype.toString.call(item) !== '[object Null]' &&
          ((data.length > 1 && (data[1] === '--' || Object.prototype.toString.call(data[1]) === '[object Null]')) ||
            data.length === 1)
        ) {
          arrItem = {
            value: item,
            emphasis: {
              scale: false,
              lineStyle: {
                width: 2,
              },
              itemStyle: this.getsymbolStyle(color, shadowColor),
            },
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
            emphasis: {
              scale: false,
              lineStyle: {
                width: 2,
              },
              itemStyle: this.getsymbolStyle(color, shadowColor),
            },
            itemStyle: {
              color,
            },
          };
          arrData.push(arrItem);
        } else if (
          item !== '--' &&
          Object.prototype.toString.call(item) !== '[object Null]' &&
          Object.prototype.toString.call(data[index - 1]) === '[object Null]' &&
          Object.prototype.toString.call(data[index + 1]) === '[object Null]'
        ) {
          arrItem = {
            value: item,
            emphasis: {
              scale: false,
              lineStyle: {
                width: 2,
              },
              itemStyle: this.getsymbolStyle(color, shadowColor),
            },
            itemStyle: {
              color,
            },
          };
          arrData.push(arrItem);
        } else if (item === alarmVO.outOfLimitValue || item === alarmVO.peakValue) {
          arrItem = {
            value: item,
            emphasis: {
              scale: false,
              lineStyle: {
                width: 2,
              },
              itemStyle: this.getsymbolStyle(color, shadowColor),
            },
            itemStyle: this.getsymbolStyle(color, shadowColor),
          };
          arrData.push(arrItem);
        } else {
          arrItem = {
            value: item,

            emphasis: {
              scale: false,
              lineStyle: {
                width: 2,
              },
              itemStyle: this.getsymbolStyle(color, shadowColor),
            },
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
  }
  //#endregion
}

export default AlarmChartService;
