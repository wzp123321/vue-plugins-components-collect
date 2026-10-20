/* eslint-disable class-methods-use-this */
/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/*
 * @Description: 告警曲线服务
 * @Author: zpwan
 * @Date: 2022-05-26 10:14:51
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-05-27 10:59:11
 */
import { ref, nextTick } from 'vue';

import {
  init,
  EChartsType,
  EChartsOption,
  XAXisComponentOption,
} from 'echarts';

import { formatDate } from '../../../utils';
import { alarmChart } from '../alarm-detail.function';
import { Big } from 'big.js';

const DANGER_COLOR = 'rgba(247, 75, 68, 1)'; // 越上限颜色
const DANGER_SHADOW_COLOR = '#fcbcc0'; // 高亮浅色
const NORMAL_COLOR = 'rgba(24, 144, 255, 1)'; // 未越限颜色
const NORMAL_SHADOW_COLOR = '#b7dcff'; // 未越限浅色
const DOWN_COLOR = 'rgb(224, 200, 38)'; // 越下限颜色
const DOWN_SHADOW_COLOR = 'rgb(224, 200, 38,0.45)'; // 越下限浅色
const TEXT_PRIMARY_COLOR = 'rgba(0, 0, 0, 0.65)'; // 正常文本色
const TEXT_SECOND_PRIMARY_COLOR = 'rgba(0, 0, 0, 0.45)'; // 浅色文本
const XIAS_LINE_COLOR = 'rgba(216, 216, 216, 1)'; // 轴线颜色

class AlarmChartService {
  // #region
  private _is_init = ref<boolean>(false);

  private _dataSource = ref<alarmChart>();

  private _type = '';

  private _customChartId = ref<string>('');

  private echartsInstance?: EChartsType;

  // #endregion
  // #region
  public get customChartId(): string {
    return this._customChartId.value;
  }

  /**
   * 释放 ECharts 实例，防止内存泄漏
   * - 每次 initChart 前应调用此方法清理旧实例
   * - 组件销毁时也应调用
   */
  public dispose(): void {
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = undefined;
    }
  }

  private alarmVO: {
    unit: string;
    data: number[];
    xaxis: number[];
    thresholdValue: number;
    peakValue: number;
    outOfLimitValue: number;
    resumeValue: number;
    upFlag: string;
  } = {
    unit: '',
    data: [],
    xaxis: [],
    thresholdValue: 0,
    peakValue: 0,
    outOfLimitValue: 0,
    resumeValue: 0,
    upFlag: '',
  };

  public set dataSource(val: alarmChart) {
    this._dataSource.value = val;
    this.alarmVO.xaxis = val.xaxis;
    this.alarmVO.peakValue = val.peakValue;
    this.alarmVO.thresholdValue = val.overrunValue;
    console.log(this.alarmVO.thresholdValue);
    this.alarmVO.outOfLimitValue = val.value;
    this.alarmVO.unit = val.unit;
    this.alarmVO.resumeValue = val.resumeValue;
    const data: number[] = [];
    val.data.forEach((el: any) => {
      data.push(el);
    });
    this.alarmVO.data = data;
    console.log(this.alarmVO, this._dataSource, 'aaaaaaaaaaaaaaaaaaaaaaaaaaa');
  }

  constructor() {
    this._customChartId.value = `charts_${(Math.random() * 10000).toFixed(0)}`;
    this._is_init.value = true;
  }

  // #region 初始化
  initChart(id: string, type?: string) {
    this._type = type ?? '';
    if (!this._is_init.value) {
      console.warn('请先初始化服务！');
      return;
    }
    // 先释放旧的 ECharts 实例，防止每次打开详情弹框时泄漏
    this.dispose();
    nextTick(() => {
      const containerEle = document.getElementById(id);
      console.log(containerEle, this._customChartId.value);

      if (!containerEle) {
        console.warn('加载图表容器错误！');
        return;
      }
      this.echartsInstance = init(containerEle);
      const options = this.getEchartsOptions();
      console.log(options);
      // const options = require('./optionres.json');
      this.echartsInstance.clear();
      this.echartsInstance.resize();
      this.echartsInstance.setOption(options);
    });
  }

  // #endregion
  // #region 获取echarts配置
  getEchartsOptions(): EChartsOption {
    const series = this.getSeries();
    const { min, max } = this.getYAxisMinMax((series as any)[0].data);
    return {
      title: {
        text: `单位（${this.alarmVO.unit ? this.alarmVO.unit : ''}）`,
        textStyle: {
          color: TEXT_SECOND_PRIMARY_COLOR,
          fontSize: 14,
        },
        top: 20,
        left: 10,
      },
      dataZoom:
        this.alarmVO.data.length >= 150
          ? [
              {
                type: 'slider',
                show: true,
                realtime: true,
                start: 0,
                end: 30,
                zoomLock: true,
                handleSize: '30%',
                bottom: 5,
                // right: 40,
                height: 16,
                rangeMode: ['percent', 'percent'],
                brushSelect: false,
                labelFormatter: (v: number) => {
                  if (!v) {
                    return '';
                  }
                  return formatDate(v, 'MM-DD HH:mm');
                },
              },
            ]
          : [],
      tooltip: this.getTooltip(),
      grid: {
        left: '2%',
        right: this.getGridRight(),
        bottom: '26px',
        containLabel: true,
      },
      series,
      xAxis: this.getXaxis(),
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (params: number) =>
            params === this.alarmVO.thresholdValue ? '' : `${params}`,
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
        min,
        max,
      },
      visualMap:
        this.alarmVO.thresholdValue || this.alarmVO.thresholdValue === 0
          ? this._dataSource.value?.upFlag === '1'
            ? {
                show: false,
                // 根据值来显示不同颜色
                pieces:
                  this.getDataMin() < this.alarmVO.thresholdValue
                    ? [
                        {
                          gte: this.getDataMin(),
                          lte: this.alarmVO.thresholdValue,
                          color: NORMAL_COLOR,
                        },
                        {
                          gt: this.alarmVO.thresholdValue,
                          color: DANGER_COLOR,
                        },
                      ]
                    : [
                        {
                          lte: this.alarmVO.thresholdValue,
                          color: NORMAL_COLOR,
                        },
                        {
                          gt: this.alarmVO.thresholdValue,
                          lte: this.getDataMax(),
                          color: DANGER_COLOR,
                        },
                        // {
                        //   gte: -4,
                        //   lte: -3,
                        //   color: NORMAL_COLOR,
                        // },
                        // {
                        //   gt: 0.00001,
                        //   color: DANGER_COLOR,
                        // },
                      ],
                seriesIndex: 0,
              }
            : {
                show: false,
                // 根据值来显示不同颜色
                pieces:
                  this.getDataMin() < this.alarmVO.thresholdValue
                    ? this.getDataMax() > this.alarmVO.thresholdValue
                      ? [
                          {
                            gte: this.getDataMin() - 1,
                            lte: this.alarmVO.thresholdValue,
                            color: DOWN_COLOR,
                          },
                          {
                            gt: this.alarmVO.thresholdValue,
                            color: NORMAL_COLOR,
                          },
                        ]
                      : [
                          {
                            gte: this.getDataMin() - 1,
                            lte: this.alarmVO.thresholdValue,
                            color: DOWN_COLOR,
                          },
                        ]
                    : [
                        {
                          gte: this.alarmVO.thresholdValue - 1,
                          lte: this.alarmVO.thresholdValue,
                          color: DOWN_COLOR,
                        },
                        {
                          gt: this.alarmVO.thresholdValue,
                          color: NORMAL_COLOR,
                        },
                      ],
                seriesIndex: 0,
              }
          : {
              show: false,
            },
    };
  }

  // #region 获取Y轴最大最小值
  getYAxisMinMax(data: string[] | number[]) {
    const arr: number[] = [];
    data.forEach((item: any) => {
      arr.push(item.value[1]);
    });
    let max = Math.max.apply(null, arr);
    let min = Math.min.apply(
      null,
      arr.filter((a) => a !== null),
    );
    const minus = new Big(max).minus(new Big(min));
    const interval = new Big(minus).div(new Big(5)).toNumber();
    max = new Big(max).plus(new Big(interval)).toNumber();
    min = new Big(min).minus(new Big(interval)).toNumber();
    if (max === min) {
      const selfInterval = new Big(max).div(new Big(5)).toNumber();
      min = new Big(min).minus(selfInterval).toNumber();
      max = new Big(max).plus(selfInterval).toNumber();
    }

    return {
      max,
      min,
    };
  }

  // #endregion
  getDataMin() {
    const arr: any[] = [];
    this.alarmVO.data.forEach((el: any) => {
      if (el.value || el.value === 0) {
        arr.push(el.value);
      }
    });
    if (arr.length > 0) {
      return Math.min.apply(
        null,
        arr.filter((item) => item !== null),
      );
    } else {
      return this.alarmVO.thresholdValue - 1;
    }
  }

  getDataMax() {
    const arr: any[] = [];
    this.alarmVO.data.forEach((el: any) => {
      if (el.value || el.value === 0) {
        arr.push(el.value);
      }
    });
    if (arr.length > 0) {
      return Math.max.apply(null, arr);
    } else {
      return this.alarmVO.thresholdValue + 1;
    }
  }

  // #region tooltip
  getTooltip(): EChartsOption['tooltip'] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    return {
      trigger: 'axis',
      borderWidth: 0,
      padding: [0],
      formatter(params: any) {
        const value = params[0]?.value[1];
        if (!that._dataSource.value?.data[params[0].dataIndex]) {
          return ``;
        }
        const thresholdValue =
          that._dataSource.value?.data[params[0].dataIndex].overRunValue;
        const thresholdValueReal =
          thresholdValue || thresholdValue === 0 ? thresholdValue : '--';
        const alarmFlag =
          that._dataSource.value?.data[params[0].dataIndex].alarmFlag;
        const peakFlag =
          that._dataSource.value?.data[params[0].dataIndex].peakFlag;
        const resumeFlag =
          that._dataSource.value?.data[params[0].dataIndex].resumeFlag;
        const date = Number(params[0]?.axisValue);
        const borderColor =
          that.alarmVO.thresholdValue || that.alarmVO.thresholdValue === 0
            ? that._dataSource.value?.upFlag === '1'
              ? value > that.alarmVO.thresholdValue
                ? DANGER_COLOR
                : NORMAL_COLOR
              : value > that.alarmVO.thresholdValue
              ? NORMAL_COLOR
              : DOWN_COLOR
            : NORMAL_COLOR;
        // const borderColor = NORMAL_COLOR;
        const labelColor = TEXT_SECOND_PRIMARY_COLOR;
        const valueColor = TEXT_PRIMARY_COLOR;
        const marginBottom = '8px';
        let str: any;
        if (alarmFlag === '1') {
          if (peakFlag === '1') {
            str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                      <div style="color: ${labelColor}">越限值/峰值</div>
                      <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${
              value ?? '--'
            }</div>
                      <div style="color: ${labelColor}">越限/峰值时间</div>
                      <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                      ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                      </div>
                      <div style="color: ${labelColor}">阈值</div>
                      <div style="color: ${valueColor};">${thresholdValueReal}</div>
                  </div>`;
          } else {
            str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                    <div style="color: ${labelColor}">越限值</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${
              value ?? '--'
            }</div>
                    <div style="color: ${labelColor}">越限时间</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                    ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                    </div>
                    <div style="color: ${labelColor}">阈值</div>
                    <div style="color: ${valueColor};">${thresholdValueReal}</div>
                </div>`;
          }
        } else if (peakFlag === '1') {
          str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                    <div style="color: ${labelColor}">峰值</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${
            value ?? '--'
          }</div>
                    <div style="color: ${labelColor}">峰值时间</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                    ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                    </div>
                </div>`;
        } else if (resumeFlag === '1') {
          str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                    <div style="color: ${labelColor}">恢复值</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${
            value ?? '--'
          }</div>
                    <div style="color: ${labelColor}">恢复时间</div>
                    <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                    ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                    </div>
                    <div style="color: ${labelColor}">阈值</div>
                    <div style="color: ${valueColor};">${thresholdValueReal}</div>
                </div>`;
        } else {
          if (params[0].dataIndex === that.alarmVO.data.length - 1) {
            str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                      <div style="color: ${labelColor}">当前值</div>
                      <div style="color: ${valueColor};margin-bottom: ${marginBottom}">${
              value ?? '--'
            }</div>
                      <div style="color: ${labelColor}">当前时间</div>
                      <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                      ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                      </div>
                      <div style="color: ${labelColor}">阈值</div>
                      <div style="color: ${valueColor};">${thresholdValueReal}</div>
                  </div>`;
          } else {
            str = `<div style="padding: 10px 16px 12px;border:2px solid ${borderColor};border-radius: 4px;line-height: 22px">
                  <div style="font-weight:bold;color: ${valueColor};margin-bottom: ${marginBottom}">${
              value ?? '--'
            }</div>
                  <div style="color: ${valueColor};margin-bottom: ${marginBottom}">
                  ${formatDate(date, 'YYYY-MM-DD HH:mm:ss')}
                  </div>
              </div>`;
          }
        }
        return str;
      },
      position: (point, _params, _dom, _rect, size) => [
        point[0] + size.contentSize[0] + 40 < size.viewSize[0]
          ? point[0] + 34
          : point[0] - 34 - size.contentSize[0],
        8,
      ],
      axisPointer: {
        type: 'line',
        axis: 'x',
        snap: false,
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

  // #endregion
  // #region xaxis
  getXaxis(): XAXisComponentOption {
    let arr: any[] = [];
    // if (data.length < 30) {
    //   console.log(data.length, '---------length');
    //   const rest = data.length - 7;
    //   let leftAdd: number;
    //   let rightAdd: number;
    //   if (rest <= 12) {
    //     if ((12 - rest) % rest === 0) {
    //       leftAdd = 0;
    //       rightAdd = (12 - rest) / rest + 1;
    //     } else {
    //       leftAdd = rest;
    //       rightAdd = 12;
    //     }
    //   } else {
    //     leftAdd = rest - 6;
    //     rightAdd = 6;
    //   }
    //   leftAdd -= 1;
    //   rightAdd -= 1;
    //   this.alarmVO.xaxis.forEach((el, i) => {
    //     if (i < 6) {
    //       arr.push(el + '');
    //       for (i = 0; i < leftAdd; i++) {
    //         arr.push('');
    //       }
    //     } else if (i === 6) {
    //       arr.push(el + '');
    //     } else {
    //       for (i = 0; i < rightAdd; i++) {
    //         arr.push('');
    //       }
    //       arr.push(el + '');
    //     }
    //   });
    // } else {
    arr = [];
    // console.log(this.alarmVO.xaxis);
    this.alarmVO.xaxis.forEach((el) => {
      arr.push(el);
    });
    // }
    if (this._type === 'high' && this.alarmVO.xaxis.length < 121) {
      arr.push(this.alarmVO.xaxis[0] + 60 * 60 * 1000);
    }

    return {
      type: 'time',
      boundaryGap: false,
      data: arr,
      axisLabel: {
        show: false, // 不显示文本
      },
      axisTick: {
        show: false,
        // interval: (index: number, value: string) => {
        //   console.log(index, value);
        //   return true;
        // },
      },
      axisLine: {
        lineStyle: {
          color: XIAS_LINE_COLOR, // 轴线颜色
        },
      },
    } as any;
  }

  // #endregion
  // #region series
  getGridRight() {
    return `${String(this.alarmVO.thresholdValue).length * 6 + 40}px`;
  }

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
        data: this.getDataIsShowDot(this.alarmVO.data),
        markPoint: this.getMarkPoint(),
        markLine:
          this.alarmVO.thresholdValue || this.alarmVO.thresholdValue === 0
            ? this._dataSource.value?.upFlag === '1'
              ? {
                  symbol: ['none', 'none'],
                  data: [
                    {
                      emphasis: {
                        lineStyle: {
                          width: 1,
                        },
                      },
                      yAxis: this.alarmVO.thresholdValue.toFixed(10),
                      label: {
                        show: true,
                        position: 'end',
                        color: DANGER_COLOR,
                        distance: 20,
                      },
                      lineStyle: {
                        width: 1,
                        color: DANGER_COLOR,
                      },
                    },
                  ],
                }
              : {
                  symbol: ['none', 'none'],
                  data: [
                    {
                      emphasis: {
                        lineStyle: {
                          width: 1,
                        },
                      },
                      yAxis: this.alarmVO.thresholdValue,
                      label: {
                        show: true,
                        position: 'end',
                        color: DOWN_COLOR,
                        distance: 20,
                      },
                      lineStyle: {
                        width: 1,
                        color: DOWN_COLOR,
                      },
                    },
                  ],
                }
            : {},
      },
    ];
  }

  // #endregion
  // #region markpoint
  getMarkNormal(val: number) {
    if (this._dataSource.value?.upFlag === '1') {
      if (val > this.alarmVO.thresholdValue) {
        return {
          borderColor: 'rgb(252,188,192)',
          borderWidth: 4,
          color: '#ea3f2e',
        };
      } else {
        return {
          borderColor: NORMAL_SHADOW_COLOR,
          borderWidth: 4,
          color: NORMAL_COLOR,
        };
      }
    } else {
      if (val > this.alarmVO.thresholdValue) {
        return {
          borderColor: NORMAL_SHADOW_COLOR,
          borderWidth: 4,
          color: NORMAL_COLOR,
        };
      } else {
        return {
          borderColor: DOWN_SHADOW_COLOR,
          borderWidth: 4,
          color: DOWN_COLOR,
        };
      }
    }
  }

  getMarkPoint(): any {
    const data = [];
    if (
      Object.prototype.toString.call(this.alarmVO?.outOfLimitValue) !==
        '[object Null]' &&
      Object.prototype.toString.call(this.alarmVO?.outOfLimitValue) !==
        '[object Undefined]' &&
      this.alarmVO?.data?.length
    ) {
      let xAxis: number = 0;
      this.alarmVO.data.forEach((_item, index) => {
        if (this._dataSource.value?.data[index].alarmFlag === '1') {
          xAxis = this.alarmVO.xaxis[index];
        }
      });
      data.push({
        xAxis,
        yAxis: this.alarmVO.outOfLimitValue,
        name: '越限值',
        symbol: 'circle',
        symbolSize: 13,
        value: '越限值',
        itemStyle: {
          // borderWidth: 0,
          normal: this.getMarkNormal(this.alarmVO.outOfLimitValue),
        },
        label: {
          color: TEXT_PRIMARY_COLOR,
          position: [-30, 20],
        },
      });
    }
    if (
      Object.prototype.toString.call(this.alarmVO?.peakValue) !==
        '[object Null]' &&
      Object.prototype.toString.call(this.alarmVO?.peakValue) !==
        '[object Undefined]' &&
      this.alarmVO?.data?.length
    ) {
      let xAxis: number = 0;
      this.alarmVO.data.forEach((_item: any, index: any) => {
        if (this._dataSource.value?.data[index].peakFlag === '1') {
          xAxis = this.alarmVO.xaxis[index];
        }
      });
      data.push({
        xAxis,
        yAxis: this.alarmVO.peakValue,
        symbol: 'circle',
        symbolSize: 13,
        value: '峰值点',
        name: '峰值点',
        itemStyle: {
          // borderWidth: 0,
          normal: this.getMarkNormal(this.alarmVO.peakValue),
        },
        label: {
          color: TEXT_PRIMARY_COLOR,
          position: [12, -20],
        },
      });
    }
    if (
      Object.prototype.toString.call(this.alarmVO?.peakValue) !==
        '[object Null]' &&
      Object.prototype.toString.call(this.alarmVO?.peakValue) !==
        '[object Undefined]' &&
      this.alarmVO?.data?.length
    ) {
      let xAxis: number = 0;
      this.alarmVO.data.forEach((_item: any, index: any) => {
        if (this._dataSource.value?.data[index].resumeFlag === '1') {
          xAxis = this.alarmVO.xaxis[index];
        }
      });

      data.push({
        xAxis,
        yAxis: this.alarmVO.resumeValue,
        value: '恢复点',
        name: '恢复点',
        symbol: 'circle',
        symbolSize: 13,
        itemStyle: {
          // borderWidth: 0,
          normal: this.getMarkNormal(this.alarmVO.resumeValue),
        },
        label: {
          color: TEXT_PRIMARY_COLOR,
          position: [20, 20],
        },
      });
    }
    return {
      symbolSize: 0, // 容器大小
      data,
    };
  }

  // #region 获取symbolStyle
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

  // #endregion
  // #region 判断是否展示点
  getDataIsShowDot(data: string[] | number[]) {
    const arr: any[] = [];
    data.forEach((item: any, i: number) => {
      const color =
        this.alarmVO.thresholdValue || this.alarmVO.thresholdValue === 0
          ? this._dataSource.value?.upFlag === '1'
            ? item.value > this.alarmVO.thresholdValue
              ? DANGER_COLOR
              : NORMAL_COLOR
            : item.value > this.alarmVO.thresholdValue
            ? NORMAL_COLOR
            : DOWN_COLOR
          : NORMAL_COLOR;
      const shadowColor =
        this.alarmVO.thresholdValue || this.alarmVO.thresholdValue === 0
          ? this._dataSource.value?.upFlag === '1'
            ? item.value > this.alarmVO.thresholdValue
              ? DANGER_SHADOW_COLOR
              : NORMAL_SHADOW_COLOR
            : item.value > this.alarmVO.thresholdValue
            ? NORMAL_SHADOW_COLOR
            : DOWN_SHADOW_COLOR
          : NORMAL_SHADOW_COLOR;
      arr.push({
        value: [this.alarmVO.xaxis[i], item.value],
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
      });
    });
    if (this._type === 'high' && this.alarmVO.xaxis.length < 121) {
      arr.push({
        value: [this.alarmVO.xaxis[0] + 60 * 60 * 1000, null],
        emphasis: {
          scale: false,
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: 'red',
          },
        },
        itemStyle: {
          color: 'transparent',
        },
      });
    }

    return arr;
  }
  // #endregion
}

export default AlarmChartService;
