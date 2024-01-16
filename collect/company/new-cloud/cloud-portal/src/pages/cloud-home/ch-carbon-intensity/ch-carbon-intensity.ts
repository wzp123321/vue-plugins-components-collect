import { defineComponent, onMounted, ref, computed, onUnmounted } from 'vue';
import { interval, Subject, takeUntil, fromEvent, debounceTime } from 'rxjs';

import { init } from 'echarts';
import { use, graphic } from 'echarts/core';
import { GridComponent, GridComponentOption, TooltipComponent } from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

import ChCarbonIntensityService from './service/ch-carbon-intensity.service';
import { TResEchartsObj } from './service/ch-carbon-intensity.service.api';
import { IRes } from '@/core/communication';

use([GridComponent, BarChart, CanvasRenderer, TooltipComponent]);
type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

interface XDataWidthObj {
  start: number;
  end: number;
}
export default defineComponent({
  name: 'CarbonIntensity',
  setup() {
    //#region 生命周期
    const _destroy$ = new Subject<void>();

    const dataList = ref<TResEchartsObj[]>([]);
    const customEchartId = computed(() => {
      return `carbon-chart-${(Math.random() * 1000000).toFixed(0)}`;
    });
    let myChart: echarts.ECharts;
    let yMax: number;

    const setECharts = async () => {
      const xData: string[] = [];
      const base = +getComputedStyle(document.documentElement).fontSize.split('px')[0] / 100;
      const seriesData: Array<BarSeriesOption> = [
        {
          type: 'bar', //---类型
          itemStyle: {
            //---图形形状
            color: new graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: '#1A24FF',
              },
              {
                offset: 1,
                color: '#008AFF',
              },
            ]),
            borderRadius: [18 * base, 18 * base, 0, 0],
          },
          barWidth: 8 * base, //---柱形宽度
          barCategoryGap: '10%', //---柱形间距
          data: [],
        },
      ];
      const res: IRes<TResEchartsObj[]> = await ChCarbonIntensityService.queryCarbonEmissionIntensity();
      dataList.value = res && res.data && res.data !== null ? res.data : [];
      const data = dataList.value;
      data.forEach((item: any) => {
        if (item.name === '托管医院平均值') {
          (seriesData[0].data as any[]).push({
            value: item.value ? item.value : 0,
            itemStyle: {
              color: new graphic.LinearGradient(0, 1, 0, 0, [
                {
                  offset: 0,
                  color: '#00B261',
                },
                {
                  offset: 1,
                  color: '#00C56C',
                },
              ]),
            },
          });
        } else {
          (seriesData[0].data as any[]).push({ value: item.value ? item.value : 0 });
        }
        xData.push(item.name);
      });
      const chartDom = document.getElementById(customEchartId.value)!;
      const leftBase = 63 * base;
      let num = leftBase;
      const xWidth = (430 * base - leftBase) / xData.length;
      let xDataWidthList: XDataWidthObj[] = [];
      xData.forEach((item, index) => {
        const obj = {
          start: 0,
          index: 0,
          end: 0,
        };
        obj.start = num;
        obj.end = obj.start + xWidth;
        num += xWidth;
        xDataWidthList.push(obj);
      });
      myChart = init(chartDom);
      const option: EChartsOption = {
        //-------------   x轴   -------------------
        xAxis: {
          data: xData,
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            interval: 0,
            formatter: (value: string) => {
              let ret = '';
              const maxLength = 4;
              const valLength = value.length;
              const rowN = Math.ceil(valLength / maxLength);
              if (rowN > 1) {
                for (let i = 0; i < rowN; i++) {
                  let temp = '';
                  const start = i * maxLength;
                  const end = start + maxLength;
                  temp = value.substring(start, end) + '\n';
                  ret += temp;
                }
                return ret;
              } else {
                return value;
              }
            },
            color: '#fff',
            fontSize: 14 * base,
            lineHeight: 20 * base,
          },
        },
        yAxis: {
          name: '单位：tCO₂/亿美元',
          nameTextStyle: {
            padding: [0, 0, 5 * base, 24 * base],
            color: '#fff',
            fontSize: 14 * base,
          },
          axisLine: {
            //---坐标轴 轴线
            show: false, //---是否显示
          },
          //坐标轴刻度线标签的相关设置
          axisLabel: {
            interval: 0,
            color: '#fff',
            formatter: (value: string) => {
              yMax = Number(value);
              return value;
            },
            fontSize: 14 * base,
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.2)',
            },
          },
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          borderRadius: 2 * base,
          borderWidth: 0,
          backgroundColor: '#00306e',
          axisPointer: {
            type: 'none',
          },
          position: function (point: any, params: any, dom: any, rect: any, size: any) {
            const index = xDataWidthList.findIndex((item) => {
              return point[0] > item.start && point[0] < item.end;
            });
            // 固定在顶部
            const value = params[0].value;
            return [
              `${15 + (80 / xData.length) * index + ((xWidth - size.contentSize[0]) / 2 / (450 * base)) * 100}%`,
              `${(1 - value / yMax) * (172 / 302) * 100}%`,
            ];
          },
          padding: 14 * base,
          formatter: (params: any) => {
            return `${params[0].value}`;
          },
          textStyle: {
            color: 'rgba(255, 255, 255, 85)',
            fontSize: 14 * base,
          },
        },
        grid: {
          top: 54 * base,
          left: 20 * base,
          right: 22 * base,
          bottom: 0,
          containLabel: true,
        },
        //------------ 内容数据  -----------------
        series: seriesData,
      };
      myChart.setOption(option);
    };

    onMounted(() => {
      setECharts();
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          myChart.resize();
          setECharts();
        });

      fromEvent(window, 'resize')
        .pipe(takeUntil(_destroy$), debounceTime(233))
        .subscribe(() => {
          if (myChart) {
            myChart.resize();
          }
          setECharts();
        });
    });
    onUnmounted(() => {
      _destroy$.next();
      _destroy$.complete();
    });

    return {
      dataList,
      customEchartId,
    };
  },
});
