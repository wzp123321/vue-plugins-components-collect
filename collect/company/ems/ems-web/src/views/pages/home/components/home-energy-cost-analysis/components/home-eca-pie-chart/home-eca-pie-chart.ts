import { defineComponent, PropType, onMounted, computed } from 'vue';
import { format, EChartsOption } from 'echarts';
import EchartsConfig from '@/config/echarts/index';
import { useStore } from 'vuex';
import { Common_IObject } from '@/services/common/common-api';
export interface ItemCode {
  value: any;
  name: string;
}
export default defineComponent({
  name: 'EcaPieChart',
  props: {
    dataList: {
      type: Array as PropType<ItemCode[]>,
      default: [],
    },
    title: {
      type: String,
      default: '',
    },
    unit: {
      // 标题和单位集合
      type: String,
      default: '',
    },
  },
  setup(props) {
    const store = useStore();
    const formatUtil: any = format;
    // 主题
    const theme = computed(() => {
      return store.getters.theme || 'light';
    });
    const getPieEchartsOption = () => {
      const option: EChartsOption = {
        color: EchartsConfig.echartsConstant.CHARTS_PIE_MAIN_COLOR,
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',

          textStyle: {
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
          },
          borderWidth: 0,
          padding: [8, 8, 8, 8],
          formatter: (params: any) => {
            return `<p style="  white-space: pre-wrap;
            margin: 0; padding: 0; word-break: break-all; color: rgba(255, 255, 255, 0.85);">${params.name}: ${params.data.showValue}${params.data.unit}</p>`;
          },
        },
        legend: Object.assign(
          EchartsConfig.echartsOption(theme.value)
            .ECHARTS_LINECHART_LEGEND_OPTION,
          {
            type: 'scroll',
            orient: 'vertical',
            top: 'middle',
            right: 30,
            itemGap: 30,
            itemWidth: 20,
            itemHeight: 8,
            selectedMode: true,
            pageIconSize: 14,
            pageIconColor: '#1890ff',
            pageIconInactiveColor: '#d8d8d8',
            data: legendData(props.dataList),
            selected: resetSelcted(props.dataList),
            // 处理图例过长
            formatter: (name: any) => {
              return formatUtil.truncateText(
                name,
                140,
                '14px Microsoft Yahei',
                '…',
              );
            },
            tooltip: {
              show: true,
            },
          },
        ),
        series: [
          {
            type: 'pie',
            // startAngle: 120,
            avoidLabelOverlap: true,
            radius: ['35%', '55%'],
            center: ['40%', '48%'],
            // left: '4%',
            label: {
              formatter: '{d}%',
            },
            // 延伸线
            labelLine: {
              length: 10,
              length2: 20,
            },
            data: resetData(props.dataList),
          },
        ],
      };
      // console.log(option)
      return option;
    };
    // 数据处理
    const resetData = (data: ItemCode[]) => {
      const arr: any[] = [];

      data.forEach((item: any, index: number) => {
        // console.log(item.energyName)
        let seat = '\uFEFF';
        for (let s = 0; s < index; s++) {
          seat = seat + '\uFEFF';
        }
        const arrItem = {
          value: item.cost,
          showValue: item.tenThousandCost,
          name: item.energyName + seat,
          unit: item.unit,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color:
                    EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                      index %
                        EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR
                          .length
                    ][0], // 0% 处的颜色
                },
                {
                  offset: 1,
                  color:
                    EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                      index %
                        EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR
                          .length
                    ][1], // 100% 处的颜色
                },
              ],
              global: false, // 缺省为 false
            },
          },
        };
        arr.push(arrItem);
      });
      // console.log(arr)
      return arr;
    };
    // 数据为0时，选中图例
    const resetSelcted = (data: ItemCode[]) => {
      const selectObj:Common_IObject = {};

      data.forEach((item: any, i: any) => {
        //console.log(item)
        let seat = '\uFEFF';
        for (let s = 0; s < i; s++) {
          seat = seat + '\uFEFF';
        }
        if (item.cost === 0) {
          selectObj[item.energyName + seat] = false;
        } else {
          selectObj[item.energyName + seat] = true;
        }
      });
      //  console.log(selectObj)
      return selectObj;
    };
    const legendData = (data: ItemCode[]) => {
      const legendData: any = [];

      data.forEach((item: any, i: any) => {
        let seat = '\uFEFF';
        for (let s = 0; s < i; s++) {
          seat = seat + '\uFEFF';
        }
        legendData.push(item.energyName + seat);
      });
      return legendData;
    };
    return {
      getPieEchartsOption,
    };
  },
});
