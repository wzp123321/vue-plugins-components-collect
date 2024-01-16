import { addMinutes, addHours } from 'date-fns';
import { defineComponent, ref, onUnmounted, computed } from 'vue';
import EchartsConfig from '@/config/echarts/index';
// utils
import { useStore } from 'vuex';
import Deffer, { formatDate, dataURLtoFile, thousandSeparation } from '@/utils/index';
import { EChartsOption, init } from 'echarts';
import { cloneDeep } from 'lodash';
import { EContrastType } from '../../energy-contrast.api';

export default defineComponent({
  props: {
    // 时间颗粒度
    timeUnit: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    let myChart = ref<any>(null);
    // store
    const store = useStore();
    // 动态生成id
    const echartsContainerId = computed(() => {
      return 'charts_' + (Math.random() * 1000).toFixed(0);
    });
    /**
     * 把大数组 按照series内数据长度来拆分对应legend的事件戳数组
     */
    const seriesXaxisArr = ref<number[][]>([]);
    // 多时间颗粒度为年
    let isBar = false;
    // 多时间下 x轴最大展示数
    let xAxisMaxLen = 0;
    let numIndexSort: number[] = [];
    // 生成双重数组 每个图例对应时间戳数组
    const getSeriesAaxisArr = (list: number[], data: GlobalModule.CommonObject[]) => {
      seriesXaxisArr.value = [];
      xAxisMaxLen = 0;
      const timeArrNew = cloneDeep(list);
      let i = 0;
      data.forEach((item) => {
        const arr = timeArrNew.slice(i, i + item.values.length);
        if (item.values?.length > xAxisMaxLen) {
          xAxisMaxLen = item.values?.length;
        }
        i += item.values.length;
        seriesXaxisArr.value?.push(arr);
      });
    };
    // 初始化
    const getEnergyContrastLineData = (
      value: any,
      queryContrastEchartsParams: EnergyContrastManageModule.EnergyContrastQueryParams,
    ) => {
      if (queryContrastEchartsParams.queryFlag === EContrastType.多时间) {
        // 生成二维数组
        getSeriesAaxisArr(value.barChart.xaxisTimes, value.barChart.barChartSeriesList);
      }

      // 获取单位
      const unit =
        value &&
        value.barChart &&
        value.barChart.yaxisItemList &&
        value.barChart.yaxisItemList.length > 0 &&
        value.barChart.yaxisItemList[0] &&
        value.barChart.yaxisItemList[0].unit;
      // 多时间
      if (queryContrastEchartsParams.queryFlag === EContrastType.多时间 && queryContrastEchartsParams.multiTimeList) {
        numIndexSort = [];
        for (let z = 0; z < queryContrastEchartsParams.multiTimeList.length; z++) {
          let timestap;
          if (queryContrastEchartsParams.timeType === 4) {
            timestap = new Date(
              new Date(queryContrastEchartsParams.multiTimeList[z].split('~')[0]).toLocaleDateString(),
            ).getTime();
          } else {
            timestap = new Date(new Date(queryContrastEchartsParams.multiTimeList[z]).toLocaleDateString()).getTime();
          }
          numIndexSort.push(value.barChart.xaxisTimes.indexOf(timestap));
        }
      }

      console.log('queryContrastEchartsParams------------', queryContrastEchartsParams);
      // 多时间 & 年 & 年颗粒度
      isBar = false;
      isBar =
        queryContrastEchartsParams.queryFlag === EContrastType.多时间 &&
        queryContrastEchartsParams.timeUnit === '1y' &&
        queryContrastEchartsParams.timeType === 3;
      // x轴数据
      const xaxisTimes: number[] = cloneDeep(value.barChart.xaxisTimes);

      const seriesData: any = [];
      // 多时间
      if (queryContrastEchartsParams.queryFlag === EContrastType.多时间 && queryContrastEchartsParams.multiTimeList) {
        try {
          let deepMultiTimeList = cloneDeep(queryContrastEchartsParams.multiTimeList);
          const multiTimeArr = [];
          // 多选周
          if (queryContrastEchartsParams.multiTimeList[0].indexOf('~') !== -1) {
            for (let m = 0; m < deepMultiTimeList.length; m++) {
              multiTimeArr.push(new Date(deepMultiTimeList[m].split('~')[0]).getTime());
            }
          } else {
            for (let m = 0; m < deepMultiTimeList.length; m++) {
              multiTimeArr.push(new Date(deepMultiTimeList[m]).getTime());
            }
          }
          multiTimeArr.sort();
          deepMultiTimeList = multiTimeArr.map((item) => {
            return formatDate(item).slice(0, 10);
          });
          // 多选周
          if (queryContrastEchartsParams.multiTimeList[0].indexOf('~') !== -1) {
            for (let zz = 0; zz < deepMultiTimeList.length; zz++) {
              for (let mm = 0; mm < queryContrastEchartsParams.multiTimeList.length; mm++) {
                if (queryContrastEchartsParams.multiTimeList[mm].indexOf(deepMultiTimeList[zz]) !== -1) {
                  deepMultiTimeList[zz] = queryContrastEchartsParams.multiTimeList[mm];
                  break;
                }
              }
            }
          }
          queryContrastEchartsParams.multiTimeList = deepMultiTimeList;
        } catch (error) {
          console.log('error', error);
        }
      }
      for (let j = 0; j < value.barChart.barChartSeriesList.length; j++) {
        // seriesData的data数组数据
        const seriesDataData: number[] = value.barChart.barChartSeriesList[j].values.map(
          (element: { name: string; value: number }) => {
            return element.value;
          },
        );
        // 非柱状图
        if (!isBar) {
          seriesData.push({
            name: EchartsConfig.echartsUtils.resetName(j + 1, value.barChart.objectNameList[j]),
            type: 'line',
            symbol: 'circle',
            smooth: true,
            showSymbol: true,
            symbolSize: 16,
            emphasis: {
              itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(
                EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[j],
              ),
            },
            lineStyle: {
              color: EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[j],
            },
            // 处理断点数据
            data: EchartsConfig.echartsUtils.getDataIsShowDot(
              seriesDataData,
              EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[j],
            ),
          });
        } else if (queryContrastEchartsParams.multiTimeList) {
          const arr = [];
          for (let i = 0; i < j; i++) {
            arr.push(0);
          }
          seriesData.push({
            name: EchartsConfig.echartsUtils.resetName(j + 1, value.barChart.objectNameList[j]),
            type: 'bar',
            barWidth: 12,
            stack: 'total',
            itemStyle: {
              color: EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[j],
              borderRadius: [12, 12, 0, 0],
            },
            data: [...arr, value.barChart.barChartSeriesList[j].values[0].value],
          });
        }
      }

      echartsInit(value.barChart, seriesData, queryContrastEchartsParams, xaxisTimes, unit);
    };
    /**
     * 获取x轴数据
     * 10m ： 每天0点就是MM.dd 后面HH:mm
     * 1h： 每天0点就是MM.dd 后面HH:00
     * 1d： MM.dd
     * 1M： yyyy.MM
     * 1y： yyyy
     * @param list
     * @returns
     */
    const getXaxisDataFormatter = (value: string) => {
      if (!value) {
        return '';
      }
      if (isBar) {
        return value;
      }
      const time = Number(value);
      let dateStr = ''; // 如果是10m
      switch (props.timeUnit) {
        case '10m':
        case '1h':
          if (formatDate(time, 'HH:mm') === '00:00') {
            dateStr = `${new Date(time).getMonth() + 1}.${new Date(time).getDate()}`;
          } else {
            dateStr =
              props.timeUnit === '10m' ? formatDate(new Date(time), 'HH:mm') : formatDate(new Date(time), 'HH') + ':00';
          }
          break;
        case '1d':
          dateStr = `${new Date(time).getMonth() + 1}.${new Date(time).getDate()}`;
          break;
        case '1M':
          dateStr = `${formatDate(new Date(time), 'yyyy')}.${new Date(time).getMonth() + 1}`;
          break;
        case '1y':
          dateStr = `${new Date(time).getFullYear()}`;
          break;
        default:
          dateStr = '';
          break;
      }
      return dateStr;
    };
    /**
     * 根据颗粒度生成字符串
     * @param time 时间戳
     */
    const getDateTitle = (nowtime: number) => {
      if (!nowtime) {
        return '';
      }
      let dateTitle = '';
      switch (props.timeUnit) {
        case '10m':
          dateTitle = formatDate(nowtime, 'yyyy-MM-dd HH:mm') + '~' + formatDate(addMinutes(nowtime, 10), 'HH:mm');
          break;
        case '1h':
          dateTitle = formatDate(nowtime, 'yyyy-MM-dd HH:mm') + '~' + formatDate(addHours(nowtime, 1), 'HH:mm');
          break;
        case '1d':
          dateTitle = formatDate(nowtime, 'yyyy-MM-dd');
          break;
        case '1M':
          dateTitle = formatDate(nowtime, 'yyyy-MM');
          break;
        case '1y':
          dateTitle = formatDate(nowtime, 'yyyy');
          break;
        default:
          dateTitle = formatDate(nowtime, 'yyyy-MM-dd HH:mm') + '~' + formatDate(addMinutes(nowtime, 10), 'HH:mm');
          break;
      }
      return dateTitle;
    };
    /**
     * 获取legend数据
     */
    const getLegendData = (list: string[]) => {
      return list?.length
        ? list.map((item, index) => {
            return {
              name: EchartsConfig.echartsUtils.resetName(index + 1, item),
              textStyle: {
                color: EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[index],
              },
              itemStyle: {
                color: EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[index],
              },
            };
          })
        : [];
    };
    /**
     * 初始化echarts
     */
    const echartsInit = (
      Data: any,
      seriesData: any,
      queryContrastEchartsParams: EnergyContrastManageModule.EnergyContrastQueryParams,
      xaxisTimes: number[],
      unit: string,
    ) => {
      const chartDom = document.getElementById(echartsContainerId.value);
      if (!chartDom) {
        return;
      }
      (myChart as any) = init(chartDom);
      // 清除当前实例
      (myChart as any).clear();
      const option: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(24,144,255,0.8)',
          textStyle: {
            color: '#fff',
          },
          formatter(params: any) {
            // 多时间
            if (queryContrastEchartsParams.queryFlag === EContrastType.多时间) {
              let result = '';
              // 非柱状图多时间
              if (!isBar && queryContrastEchartsParams.multiTimeList) {
                for (let k = 0; k < params.length; k++) {
                  const seriesIndex = params[k].seriesIndex;
                  const dataIndex = params[k].dataIndex;
                  const nowTime = seriesXaxisArr.value[seriesIndex][dataIndex];
                  const dateStr = getDateTitle(nowTime);
                  const iconColor = EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[params[k].seriesIndex];
                  result += `<div>
                              <span style="height:8px;width:8px;display:inline-block;margin-right: 8px;
                                border:1px solid #fff;background-color:${iconColor};">
                              </span>${dateStr}：
                              ${
                                Object.prototype.toString.call(params[k].value) === '[object Null]' ||
                                Object.prototype.toString.call(params[k].value) === '[object Undefined]' ||
                                params[k].value === '--'
                                  ? '--'
                                  : thousandSeparation(params[k].value)
                              }
                              ${
                                Object.prototype.toString.call(params[k].value) === '[object Null]' ||
                                Object.prototype.toString.call(params[k].value) === '[object Undefined]' ||
                                params[k].value === '--'
                                  ? ''
                                  : unit
                              }
                            </div>`;
                }
              } else {
                // 柱状图多时间
                result = `<div>
               ${params[0].seriesName}：${
                  Object.prototype.toString.call(params[0].value) === '[object Null]' || !params[0].value
                    ? '--'
                    : thousandSeparation(params[0].value)
                }
               ${Object.prototype.toString.call(params[0].value) === '[object Null]' || !params[0].value ? '' : unit}
                </div>`;
              }
              return result;
            } else {
              // 多对象
              let result = '';
              if (params?.length) {
                const nowtime = Number(params[0].axisValue);
                const dateTitle = getDateTitle(nowtime);
                result = `<div>${dateTitle}</div>`;
                params.forEach((item: any, index: number) => {
                  result += `<div>
                              <span style="height:8px;width:8px;display:inline-block;
                                margin-right: 8px;border:1px solid #fff;background-color:
                              ${EchartsConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[index]};">
                              </span>${item.seriesName}：${
                    Object.prototype.toString.call(item.value) === '[object Null]' ||
                    Object.prototype.toString.call(item.value) === '[object Undefined]' ||
                    item.value === '--'
                      ? '--'
                      : thousandSeparation(item.value)
                  }${Object.prototype.toString.call(item.value) === '[object Null]' ? '' : unit}
                            </div>`;
                });
              }
              return result;
            }
          },
          ...EchartsConfig.echartsOption(store.getters.theme).ECHARTS_LINECHART_TOOLTIP_OPTION,
        },
        legend: {
          type: 'scroll',
          top: 5,
          itemWidth: 20,
          itemHeight: 2,
          itemGap: 24,
          textStyle: {
            fontSize: 14,
          },
          pageIconColor: '#1890ff',
          pageIconInactiveColor: '#d8d8d8',
          pageTextStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
          },
          data: getLegendData(Data.objectNameList),
        },
        grid: {
          left: 40,
          right: 40,
          top: 80,
          bottom: queryContrastEchartsParams.queryFlag === EContrastType.多对象 ? 48 : 12,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          show: queryContrastEchartsParams.queryFlag === EContrastType.多对象 || isBar,
          data: isBar
            ? Data.objectNameList
            : queryContrastEchartsParams.queryFlag === EContrastType.多时间
            ? Data.xaxisTimes.splice(0, xAxisMaxLen)
            : Data.xaxisTimes,
          axisLabel: {
            formatter: getXaxisDataFormatter,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: true,
          },
          name: '能耗值(' + Data.yaxisItemList[0].unit + ')',
          axisLabel: {
            show: true,
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.65)',
            formatter: EchartsConfig.echartsUtils.formatterText as any,
          },
        },
        dataZoom: [
          {
            type: 'slider',
            xAxisIndex: [0],
            start: 0,
            end: 100,
            bottom: 12,
            right: 40,
            height: 24,
            handleSize: '100%',
            handleStyle: {
              color: '#1890FF',
            },
            fillerColor: 'rgba(24, 144, 255, 0.1)',
            backgroundColor: 'rgba(250, 250, 250, 1)',
            borderColor: 'rgba(0, 0, 0, 0.15)',
            showDataShadow: false,
            labelFormatter: (index) => {
              const value = Data.xaxisTimes[index];
              return getXaxisDataFormatter(value);
            },
            show: queryContrastEchartsParams.queryFlag === EContrastType.多对象,
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100,
            height: 24,
            bottom: 12,
            right: 40,
            handleSize: '100%',
            handleStyle: {
              color: '#1890FF',
            },
            fillerColor: 'rgba(24, 144, 255, 0.1)',
            backgroundColor: 'rgba(250, 250, 250, 1)',
            borderColor: 'rgba(0, 0, 0, 0.15)',
            showDataShadow: false,
            show: queryContrastEchartsParams.queryFlag === EContrastType.多对象,
          },
        ],
        series: seriesData,
      };
      (myChart as any).setOption(option);
      window.addEventListener('resize', () => {
        if (myChart) {
          (myChart as any).resize();
        }
      });
    };
    /**
     * 生成图片
     */
    const toImage = () => {
      if (!myChart) {
        return;
      }
      const deffer = new Deffer();
      deffer.resolve(
        dataURLtoFile(
          (myChart as any).getDataURL({
            type: 'png',
          }),
          'contrast',
        ),
      );
      return deffer.promise;
    };
    // 组件卸载
    onUnmounted(() => {
      window.removeEventListener('resize', () => {
        if (myChart) {
          (myChart as any).resize();
        }
      });
    });
    return {
      getEnergyContrastLineData,
      echartsContainerId,
      toImage,
    };
  },
});
