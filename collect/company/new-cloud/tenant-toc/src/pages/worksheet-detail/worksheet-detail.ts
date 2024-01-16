import * as echarts from 'echarts/core';
import {
  GridComponent,
  GridComponentOption,
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
} from 'echarts/components';
import { BarChart, BarSeriesOption, PieChart, PieSeriesOption, GraphSeriesOption } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TT_EName } from './worksheet-detail.api';

import WorksheetDetailService from './worksheet-detail.service';
export default defineComponent({
  name: 'WorksheetDetail',
  setup() {
    const _destroy$ = new Subject<void>();
    echarts.use([
      GridComponent,
      BarChart,
      PieChart,
      CanvasRenderer,
      TooltipComponent,
      LegendComponent,
      LabelLayout,
      UniversalTransition,
      GraphicComponent,
    ]);
    type EChartsOption = echarts.ComposeOption<
      GridComponentOption | BarSeriesOption | PieSeriesOption | GraphSeriesOption
    >;

    const route = useRoute();
    const RADataList = ref({});
    const PADataList = ref({});
    const MADataList = ref({});
    const loading = ref(true);

    const getQueryOverview = async () => {
      loading.value = true;
      try {
        const raRes = await WorksheetDetailService.queryWorksheetDetailListService(TT_EName.报修, route.query.tenantId);
        const paRes = await WorksheetDetailService.queryWorksheetDetailListService(TT_EName.巡检, route.query.tenantId);
        const maRes = await WorksheetDetailService.queryWorksheetDetailListService(TT_EName.保养, route.query.tenantId);
        if (raRes?.data) {
          RADataList.value = raRes.data;
        }
        if (paRes?.data) {
          PADataList.value = paRes.data;
        }
        if (maRes?.data) {
          MADataList.value = maRes.data;
        }
      } catch (error) {
        console.log('查询工单概况', error);
      } finally {
        loading.value = false;
      }
    };
    const RAChartShow = ref(true);
    const PAChartShow = ref(true);
    const MAChartShow = ref(true);
    // 报修分析柱状图
    let RAChart: echarts.ECharts;
    const setRAECharts = async () => {
      const RA = document.getElementById('ra') as HTMLElement;
      if (document.getElementById('ra') == null) {
        return;
      }
      echarts.dispose(document.getElementById('ra') as HTMLElement);
      RAChart = echarts.init(RA);
      const emphasisStyle = {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      };
      // 已完成数据
      let completedData: number[] = [0];
      // 未完成数据
      let incompleteData: number[] = [0];
      let xAxisData: string[] = [''];
      try {
        const res = await WorksheetDetailService.queryWorksheetDetailService(
          TT_EName.报修,
          route.query.tenantId ? route.query.tenantId : 1231
        );
        if (res?.data) {
          // 抽离数据
          completedData = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.finishedNum},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');

          incompleteData = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.totalNum - item.finishedNum},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');

          xAxisData = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.domainName},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');
        } else {
          RAChartShow.value = false;
        }
      } catch (error) {
        console.log('获取报修图表数据', '-->', error);
      }
      const RAOption: EChartsOption = {
        legend: {
          data: [{ name: '已完成' }, { name: '未完成' }],
          bottom: '1%',
        },
        grid: {
          top: 25,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          data: xAxisData,
          axisTick: {
            show: false, // 不显示坐标轴刻度线
          },
        },
        yAxis: {
          axisLine: {
            show: false, // 不显示y轴
          },
          max: 2000,
          splitNumber: 4,
        },
        series: [
          {
            name: '已完成',
            type: 'bar',
            stack: 'one',
            emphasis: emphasisStyle,
            barWidth: '16px',
            color: '#3681FF',
            data: completedData,
            label: {
              show: true,
              color: 'black',
            },
          },
          {
            name: '未完成',
            type: 'bar',
            stack: 'one',
            emphasis: emphasisStyle,
            barWidth: '16px',
            color: '#DBE8FF',
            data: incompleteData,
            label: {
              show: true,
            },
          },
        ],
      };
      RAChart.setOption(RAOption);
      // 根据页面大小自动响应图表大小
      window.addEventListener('resize', function () {
        RAChart.resize();
      });
    };

    // 巡检分析柱状图
    let PAChart: echarts.ECharts;
    const setPAECharts = async () => {
      const PA = document.getElementById('pa') as HTMLElement;
      if (document.getElementById('pa') == null) {
        return;
      }
      echarts.dispose(document.getElementById('pa') as HTMLElement);
      PAChart = echarts.init(PA);
      // 已完成数据
      const completedData = ref<number[]>([0]);
      // 未完成数据
      const incompleteData = ref<number[]>([0]);
      const xAxisData = ref<string[]>(['']);
      try {
        const res = await WorksheetDetailService.queryWorksheetDetailService(
          TT_EName.巡检,
          route.query.tenantId ? route.query.tenantId : 1231
        );
        if (res?.data) {
          // 抽离数据
          completedData.value = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.finishedNum},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');

          incompleteData.value = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.totalNum - item.finishedNum},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');

          xAxisData.value = res.data
            .reduce((pre: any, item: any) => {
              return (pre += `${item.domainName},`);
            }, '')
            .split(',')
            .filter((i: any) => i !== '');
        } else {
          PAChartShow.value = false;
        }
      } catch (error) {
        console.log('获取巡检图表数据', '-->', error);
      }
      const PAOption: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          top: 15,
          bottom: 45,
          left: '2%',
          containLabel: true,
        },
        legend: {
          data: [{ name: '已完成' }, { name: '未完成' }],
          bottom: '1%',
        },
        xAxis: {
          axisLine: {
            show: false, // 不显示 轴线
          },
          max: 2000,
          splitNumber: 4,
        },
        yAxis: {
          axisTick: {
            show: false, // 不显示坐标轴刻度线
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.15);',
            },
          },
          data: xAxisData.value,
        },
        series: [
          {
            name: '已完成',
            type: 'bar',
            stack: 'one',
            // emphasis: emphasisStyle,
            barWidth: '16px',
            color: '#06CD72',
            data: completedData.value,
            label: {
              show: true,
            },
          },
          {
            name: '未完成',
            type: 'bar',
            stack: 'one',
            // emphasis: emphasisStyle,
            barWidth: '16px',
            color: '#CDF5E3',
            data: incompleteData.value,
            label: {
              show: true,
            },
          },
        ],
      };

      PAChart.setOption(PAOption);
      // 根据页面大小自动响应图表大小
      window.addEventListener('resize', function () {
        PAChart.resize();
      });
    };

    // 保养分析饼状图
    let MAChart: echarts.ECharts;
    const setMACharts = async () => {
      const MA = document.getElementById('ma') as HTMLElement;
      if (document.getElementById('ma') == null) {
        return;
      }
      echarts.dispose(document.getElementById('ma') as HTMLElement);
      MAChart = echarts.init(MA);
      const dataModel = [
        { value: 0, name: '强电', itemStyle: { color: '#3681FF' } },
        { value: 0, name: '锅炉', itemStyle: { color: '#06CD72' } },
        { value: 0, name: '给排水', itemStyle: { color: '#FFCA00' } },
        { value: 0, name: '医用气体', itemStyle: { color: '#FE4B4E' } },
        { value: 0, name: '电梯', itemStyle: { color: '#EC78FF' } },
        { value: 0, name: '正负压气体', itemStyle: { color: '#51E8E6' } },
        { value: 0, name: '物业', itemStyle: { color: '#9E595D' } },
        { value: 0, name: '后勤', itemStyle: { color: '#9E595D' } },
      ];
      const data: any = ref([]);

      try {
        const res = await WorksheetDetailService.queryWorksheetDetailService(
          TT_EName.保养,
          route.query.tenantId ? route.query.tenantId : 1231
        );
        if (res?.data) {
          dataModel.forEach((a1: any) => {
            res.data.forEach((a2: any) => {
              if (a2.domainName == a1.name) {
                a1.value = a2.finishedNum;
                data.value.push(a1);
              }
            });
          });
        } else {
          data.value = [];
          MAChartShow.value = false;
        }
      } catch (error) {
        console.log('获取巡检图表数据', '-->', error);
      }
      const MAOption: EChartsOption = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          bottom: '1%',
          // left: '-1%',
        },
        series: [
          {
            name: '保养分析',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 0,
              borderColor: '#fff',
              borderWidth: 1,
            },
            label: {
              formatter: '{b}\n{c}',
              lineHeight: 20,
              position: 'outer',
              alignTo: 'labelLine',
              bleedMargin: 20,
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold',
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },

            data: data.value,
          },
        ],
      };

      MAChart.setOption(MAOption);
      // 根据页面大小自动响应图表大小
      window.addEventListener('resize', function () {
        MAChart.resize();
      });
    };
    onMounted(() => {
      getQueryOverview();
      setRAECharts();
      setPAECharts();
      setMACharts();
      interval(60 * 60_000)
        .pipe(takeUntil(_destroy$))
        .subscribe(() => {
          RAChart.resize();
          PAChart.resize();
          MAChart.resize();
          setRAECharts();
          setPAECharts();
          setMACharts();
        });
    });
    return {
      RADataList,
      PADataList,
      MADataList,
      loading,
      RAChartShow,
      PAChartShow,
      MAChartShow,
    };
  },
});
