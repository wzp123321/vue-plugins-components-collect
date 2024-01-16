//#region
/**
 * MhmActualPayment 实际缴费 2022-5-31
 */
//#endregion
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Chart, registerInteraction, registerShape, registerTheme } from '@antv/g2';
import dayjs from 'dayjs';
import { sDatabase } from '../../../../services/index';
import mhmActualPaymentService from './mhm-actual-payment.service';
import {
  MHM_ActualPaymentListType,
  MHM_AllActualPaymentDataType,
  MHM_HRAType,
  NamecolorList,
} from './mhm-actual-payment.api';
import MaHomeModeService from '../../services/ma-home-model.service';

export default defineComponent({
  name: 'MhmActualPayment',
  props: {},
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();
    onUnmounted(() => {
      // 销毁订阅
      _destroy$.next();
      _destroy$.complete();
    });
    //#endregion

    onMounted(() => {
      //#region 组件传值 总节点的信息
      sDatabase.refStart$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v) {
          startTime.value = v;
        } else {
          startTime.value = new Date();
        }
      });
      sDatabase.refEnd$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v) {
          endTime.value = v;
        } else {
          endTime.value = new Date();
        }
      });
      sDatabase.refDimension$.pipe(takeUntil(_destroy$)).subscribe((v) => {
        timeType.value = v;
        if (v === 3) {
          timeType.value = 2;
        }
      });
      MaHomeModeService.getIsChangeType.pipe(takeUntil(_destroy$)).subscribe((v) => {
        if (v === 'left') {
          // 表格
        } else {
          if (isSlectYear.value) {
            if (yearSelect.value !== isSlectYear.value) {
              yearSelect.value = isSlectYear.value;
            }
          }
        }
        setTimeout(() => {
          //   mhmAPayment.getActualPaymentTbaleList(tableList.value);
        });
      });

      //#endregion

      nextTick(() => {
        chartsDataList();
      });
    });

    const mhmAPayment = reactive(mhmActualPaymentService);
    //  mhmAPayment.isSelectYear = undefined;
    const startEndDate = ref<string>();

    // 开始时间、结束时间
    const startTime = ref<Date>();
    const endTime = ref<Date>();
    const timeType = ref<number>();

    // chart图表
    let chart: typeof Chart;

    //#region 得到数据
    const actualData = ref<MHM_ActualPaymentListType>();
    const chartsData = ref<MHM_HRAType[]>([]);
    const chartsLine = ref<MHM_HRAType[]>([]);
    const legendList = ref<NamecolorList[]>([]);
    const colorArray = ref<string[]>([]);
    const tableList = ref<MHM_AllActualPaymentDataType[]>([]);
    const loading = ref<boolean>(true);
    const yearSelect = ref<number>();
    const isSlectYear = ref<number | undefined>(mhmAPayment.isSelectYear);
    const yearList = ref<{ name: string; value: number }[]>([]);
    //#endregion

    //#region 接口获得数据
    const chartsDataList = () => {
      yearList.value = [];
      const strStart = dayjs(startTime.value?.getTime()).format('YYYY年MM月');
      const strEnd = dayjs(endTime.value?.getTime()).format('YYYY年MM月');
      startEndDate.value = strStart + '~' + strEnd;
      const startYear = startTime.value?.getFullYear();
      const endYear = endTime.value?.getFullYear();
      if (startYear && endYear) {
        if (startYear === endYear) {
          yearList.value.push({
            name: String(startYear),
            value: +startYear,
          });
        } else {
          for (let i = startYear; i <= endYear; i++) {
            yearList.value.push({
              name: String(i),
              value: +i,
            });
          }
        }
      }
      // 当年
      const currentYear = new Date().getFullYear();
      const isYear = yearList.value.filter((item) => {
        return item.value === currentYear;
      });
      if (isYear && isYear.length > 0) {
        yearSelect.value = currentYear;
      } else {
        //   yearSelect.value = yearList.value[0].value;
      }
      if (isSlectYear.value) {
        if (yearSelect.value !== isSlectYear.value) {
          yearSelect.value = isSlectYear.value;
        }
      }
      //  console.log(isSlectYear.value);
      // 2023-11-13-传参改为传时间戳
      const param = {
        queryStart: (startTime.value as Date).getTime(),
        queryEnd: (endTime.value as Date).getTime(),
      };
      mhmAPayment.queryActualPayment(param);
    };
    /**
     * 年份切换
     * @param item
     */
    const yearchChange = (item: number) => {
      // 销毁图表
      chart.destroy();

      loading.value = true;
      yearSelect.value = item;
      isSlectYear.value = item;
      mhmAPayment.isSelectYear = isSlectYear.value;

      const strStart = dayjs(startTime.value?.getTime()).format('YYYY年MM月');
      const strEnd = dayjs(endTime.value?.getTime()).format('YYYY年MM月');
      startEndDate.value = strStart + '~' + strEnd;
      const param = {
        queryStart: (startTime.value as Date).getTime(),
        queryEnd: (endTime.value as Date).getTime(),
      };
      mhmAPayment.queryActualPayment(param);
      // console.log(item);
    };
    //#endregion
    mhmAPayment.getActualPaymentData.pipe(takeUntil(_destroy$)).subscribe((v) => {
      if (v) {
        actualData.value = v;
        chartsData.value = v.chartsData;
        chartsLine.value = v.lineChartsData;
        legendList.value = v.legendList;
        tableList.value = v.allEnergyActualPaymentList;
      } else {
        loading.value = false;
        chartsData.value = [];
        tableList.value = [];
        actualData.value = undefined;
      }
      // 表格
      //  mhmAPayment.getActualPaymentTbaleList(tableList.value);
    });
    /**
     * 监听图表数据是否变化
     */
    watch(
      () => chartsData.value,
      (val) => {
        if (val && val.length > 0) {
          chartsShow();
        } else {
          loading.value = false;
        }
      },
      {
        deep: true,
      },
    );

    /**
     * 画图
     */
    const contentWidth = ref<{ width: string }>();
    const chartsShow = () => {
      const contentEindth = document.querySelector('.mhm-actual-payment')?.clientWidth;
      contentWidth.value = {
        width: contentEindth + 'px',
      };

      loading.value = false;
      // console.log(contentEindth);
      //  console.log(maxNum);
      registerTheme('newTheme', { maxColumnWidth: 10 });

      chart = new Chart({
        container: 'chartContent',
        autoFit: true,
        height: 260,
        width: contentEindth,
        // defaultInteractions: ['tooltip', 'legend-active', 'continuous-filter', 'ellipsis-text'],
      });

      chart.clear();
      //  console.log(chartsData.value, '----------');
      chart.data(chartsData.value);

      chart.scale('value', {
        alias: '元',
        //  nice: true,
        //  range: [10, 20],
      });

      chart.axis('year', {
        tickLine: null,
        line: {
          style: {
            fill: '#dadada',
            color: '#dadada',
            // opacity: 0.4,
            width: 1,
            stroke: '#dadada',
          },
        },
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
        },
      });
      chart.axis('value', {
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
          formatter: (text: any) => {
            return text.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
          },
        },
        title: {
          position: 'end',
          text: '元',
          autoRotate: false,
          offset: 10,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            textAlign: 'end',
            textBaseline: 'middle',
            y: 18,
          },
        },
        position: 'left',
        line: {
          style: {
            fill: '#dadada',
            color: '#dadada',
            width: 1,
            stroke: '#dadada',
            opacity: 1,
            zIndex: 9,
          },
        },
      });
      chart.axis('rate', {
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
          formatter: (text: any) => {
            return text.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
          },
        },
        title: {
          offset: 10,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            opacity: 0.65,
          },
          position: 'end',
          text: '元',
          autoRotate: false,
        },
        position: 'left',
        line: {
          style: {
            fill: '#dadada',
            color: '#dadada',
            width: 1,
            stroke: '#dadada',
            // opacity: 0.4,
          },
        },
      });
      // chart.scale('value', {
      //   range: [0, maxNum],
      // });
      chart.scale({
        rate: { sync: 'value', nice: true },
        value: { sync: true, nice: true },
      });
      chart.axis('rate', false);

      chart.legend({
        position: 'top',
        // custom: true,
        // items: legendStyle(),
        itemName: {
          style: (item: any) => {
            // console.log(item);
            return {
              fill: item.marker.style.fill ? item.marker.style.fill : item.marker.style.stroke,
              color: item.marker.style.fill ? item.marker.style.fill : item.marker.style.stroke,
            };
          },
        },
        marker: (item: any, index: any, items: any) => {
          return {
            // symbol: index === 0 ? 'M0,0 L10,0 Z' : 'square',
            symbol: () =>
              index
                ? [['M', 9, 1], ['L', 19, 1], ['L', 19, 11], ['L', 9, 11], ['Z']]
                : [
                    ['M', 0, 6],
                    ['L', 20, 6],
                  ],
            // radius: index === 0 ? 0 : 0,
            style: {
              lineAppendWidth: 10,
              // lineWidth: 10,
              // lineHeight: -100,
              fill: items.style.stroke ? items.style.stroke : items.style.fill,
              stroke: items.style.stroke ? items.style.stroke : items.style.fill,
              lineWidth: 1,
              // lineHeight: 12,
              radius: 1,
            },
            // spacing: 50,
          };
        },
      });

      chart.tooltip({
        shared: true,
        showMarkers: true,
        showCrosshairs: false,
        crosshairs: {
          type: 'x',
          follow: true,
          line: {
            style: {
              lineWidth: 0.5,
              // fill: ' rgba(0, 0, 0, 0.5);',
              color: {
                type: 'linear',
                colorStops: [
                  {
                    offset: 1,
                    color: 'rgba(0, 178, 97, 1)', // 0% 处的颜色
                  },
                  {
                    offset: 0,
                    color: 'rgba(255, 255, 255, 1)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
              shadowColor: 'rgba(0, 178, 97, 1)', // 0% 处的颜色
              // shadowBlur: 0.5,
              type: 'solid',
              width: 0.1,
              shadowOffsetX: -0.4,
            },
          },
        },
        marker: {
          // symbol: 'circle',
          style: {
            // fill: items.style.stroke,
            // stroke: items.style.stroke,
            lineWidth: 0,
          },
        },
        customContent: (name: any, items: any) => {
          if (items.length === 0) return '';
          const container = document.createElement('div');
          container.className = 'g2-tooltip';
          const title = `<div class="g2-tooltip-title" style="margin-top: 12px;margin-bottom: 12px;">${name}</div>`;
          let listItem = '';
          items.forEach((item: any) => {
            listItem += `<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;display:flex;align-items: center;">
                <span style="background-color:${
                  item?.mappingData?.color || item?.color
                };" class="g2-tooltip-marker"></span>
                <span style="display:inline-flex;flex:1;justify-content:space-between">
                <span style="margin-right: 16px;">${item?.name}:</span><span>${item?.value}</span>
                </span>
            </li>`;
          });
          container.innerHTML = title + listItem;

          return container;
        },
        customItems: (items: any) => {
          // 去掉没有值的点的tooltip
          const newItem = items.filter((list: any) => {
            return list.value;
          });
          // 下标
          const index = newItem.findIndex((item: any) => {
            return item.name === '实际缴费';
          });
          const sortList = newItem.splice(index, 1);
          // console.log(items, newItem, sortList, index, '-------');
          const currurList = sortList.concat(newItem);
          return currurList;
        },
      });

      const actualList = chartsData.value.filter((item) => {
        return item.energyCode === '实际缴费';
      });

      const barList = chartsData.value.filter((item) => {
        return item.energyCode !== '实际缴费';
      });

      /**
       * 是否显示点
       */
      registerShape('point', 'breath-point', {
        draw(cfg: any, container: any) {
          const data: any = cfg.data;
          const point = { x: cfg.x, y: cfg.y };
          const group = container.addGroup();
          if (data.energyCode === '实际缴费' && actualList && actualList.length > 0) {
            if (
              data.index === 0 &&
              data.rate !== null &&
              ((actualList.length > 1 && actualList[1]?.rate === null) || actualList.length === 1)
            ) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 5,
                  fill: '#fff',
                  opacity: 1,
                  lineWidth: 1,
                  shadowOffsetY: 4,
                  // stroke: 'rgba(0, 0, 0, 0.09)',
                  shadowColor: 'rgba(0, 0, 0, 0.2)',
                  shadowBlur: 6,
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: data.color,
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else if (
              data.rate !== null &&
              actualList.length > 1 &&
              data.index === actualList.length - 1 &&
              actualList[actualList.length - 2]?.rate === null
            ) {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 5,
                  fill: '#fff',
                  opacity: 1,
                  lineWidth: 1,
                  shadowOffsetY: 4,
                  // stroke: 'rgba(0, 0, 0, 0.1)',
                  linewidth: 1,
                  shadowColor: 'rgba(0, 0, 0, 0.2)',
                  shadowBlur: 6,
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: data.color,
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else if (
              data.rate !== null &&
              actualList[data.index - 1]?.rate === null &&
              actualList[data.index + 1]?.rate === null
            ) {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 5,
                  fill: '#fff',
                  opacity: 1,
                  // stroke: 'rgba(0, 0, 0, 0.1)',
                  linewidth: 1,
                  shadowColor: 'rgba(0, 0, 0, 0.2)',
                  shadowBlur: 6,
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: data.color,
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 0,
                  fill: 'transparent',
                  opacity: 0,
                  zIndex: 10,
                  stroke: 'transparent',
                  linewidth: 0,
                },
              });

              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 0,
                  fill: 'transparent',
                  opacity: 0,
                  zIndex: 10,
                },
              });
            }
          }

          return group;
        },
      });

      chart.interval().adjust('stack').shape('box').position('year*value').color('name', colotList());
      // .style('name*value*prarentIndex*year*energyCode', (name, value, pindex, year, energyCode) => {
      //   let lineWidth = 0;
      //   let strokeColor = 'transparent';
      //   if (energyCode !== '实际缴费') {
      //     const dataList = barList.filter((items: any) => {
      //       return year === items.year;
      //     });
      //     // console.log(dataList);
      //     const index = dataList.findIndex((item) => {
      //       return item.name === name;
      //     });

      //     const lastIndex = dataList.length - 1;

      //     if (value && index === 0 && dataList[index + 1].value) {
      //       lineWidth = 1;
      //       strokeColor = '#fff';
      //       // console.log('====', index, !dataList[index + 1].value);
      //     } else {
      //       if (value && index > 0 && index < lastIndex) {
      //         if (dataList[index - 1].value && value > 0 && index - 1 != 0) {
      //           lineWidth = 1;
      //           strokeColor = '#fff';
      //         }
      //       } else {
      //         lineWidth = 1.5;
      //         strokeColor = 'transparent';
      //       }
      //       if (value && index > 0 && index === lastIndex) {
      //         lineWidth = 0;
      //       }
      //     }

      //   }

      //   return {
      //     lineWidth: lineWidth,
      //     stroke: strokeColor,
      //   };
      // });

      chart.line().position('year*rate').size(1).color('name', colotList()).shape('smooth').style({
        lineWidth: 1,
        shadowOffsetY: 8,
        shadowColor: 'rgba(75, 176, 255, 0.6)',
        shadowBlur: 10,
        zIndex: 99,
      });
      chart
        .point()
        .position('year*rate')
        .shape('breath-point')
        .tooltip('year*rate', (num: any, score: any) => {
          return {};
        });
      chart.interaction('legend-active', {
        start: [{ trigger: 'plot:mousemove', isEnable: false }],
        end: [{ trigger: 'plot:mouseleave', isEnable: false }],
      });
      //  chart.interaction('active-region');

      // chart.removeInteraction('legend-active');
      // chart.interaction('legend-visible-filter');

      chart.theme('newTheme');

      chart.render();
      // chart.option('scrollbar', Option);
    };

    /**
     * 颜色数组
     */
    const colotList = () => {
      const data = legendList.value;
      colorArray.value = [];
      const colorA: string[] = [];
      if (data && data.length > 0) {
        data?.map((item: NamecolorList) => {
          //  if (item.energyName !== '实际缴费') {
          colorA.push(item.colour);
          //  }
        });
      }
      return colorA;
    };
    /**
     * 图例样式
     * @returns
     */
    const legendStyle = () => {
      const data = legendList.value;
      const styleList: any = [];
      data?.map((item: NamecolorList, i: number) => {
        styleList.push({
          itemName: {
            style: {
              fill: item.colour,
              color: item.colour,
              fontSize: 14,
            },
          },
          name: item.energyName,
          value: {
            fill: item.colour,
            color: item.colour,
            style: {
              fill: item.colour,
              color: item.colour,
              fontSize: 14,
            },
          },
          marker: {
            symbol: i === 0 ? 'line' : 'square',
            radius: i === 0 ? 2 : 20,
            style: {
              fill: item.colour,
              stroke: item.colour,
              lineWidth: i === 0 ? 20 : 12,
              lineHeight: i === 0 ? 1 : 12,
              radius: 2,
            },
            spacing: 10,
          },
          style: {
            fill: item.colour,
            color: item.colour,
            fontSize: 14,
          },
          text: {
            style: {
              fill: item.colour,
              color: item.colour,
              fontSize: 14,
            },
          },
        });
      });
      return styleList;
    };

    return {
      mhmAPayment,
      actualData,
      chartsData,
      startEndDate,
      loading,
      contentWidth,
      yearSelect,
      yearList,
      yearchChange,
    };
  },
});
