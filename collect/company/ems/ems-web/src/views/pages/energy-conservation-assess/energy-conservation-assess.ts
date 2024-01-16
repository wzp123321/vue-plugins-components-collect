import { computed, defineComponent, onMounted, reactive, Ref, ref, toRefs } from 'vue';
// services
import energyConservationService from '@/views/pages/energy-conservation-assess/services/energy-conservation-assess.service';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { EChartsOption } from 'echarts';
import { formatDate, openBlankUrl } from '@/utils/index';
import { formatTooltipUtils } from './utils/index';
import { subDays } from 'date-fns';
// config
import { quotaTypeList, treeTypeList, energyConervationManageUrl } from '@/config/config';
import EchartsConfig from '@/config/echarts/index';
// components
import UsingProgress from './components/eca-using-progress/eca-using-progress.vue';
import AssessDataItem from './components/eca-assess-item/eca-assess-item.vue';
import EcaTreeSelect from './components/eca-tree-select/eca-tree-select.vue';

interface EnergyConservationState {
  expandedKeys: number[];
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
  treeList: EnergyConservationAssess.TreeDetail[];
  loading: boolean;
  unit: string;
  treeLoading: boolean;
  searchTimeType: number;
  searchParams: EnergyConservationAssess.EnergyConservationHeaderParams;
  usageProgress: EnergyConservationAssess.UsageProgress;
  trendAnalysis: EnergyConservationAssess.QuotaBalance;
  quotaBalance: EnergyConservationAssess.QuotaBalance;
  conclusion: EnergyConservationAssess.Conclusion;
}
const defaultTreeProps = {
  children: 'childTree',
  label: 'treeName',
  disabled: '',
};

export default defineComponent({
  name: 'EnergyConservationAssess',
  components: {
    UsingProgress,
    AssessDataItem,
    EcaTreeSelect,
  },
  setup() {
    const store = useStore();
    const { proxy, queryEnergyFlagOneExcludeTotalTree, treeType } = useCommonController();
    const usageProgress: EnergyConservationAssess.UsageProgress = {
      benchTitle: '',
      benchUnit: '',
      benchValue: '',
      consume: {
        itemDay: '',
        itemTitle: '',
        itemValue: 0,
        itemValueThousand: '',
        percnet: 0,
        unit: '',
      },
      endTitle: '',
      ideal: {
        itemDay: '',
        itemTitle: '',
        itemValue: 0,
        itemValueThousand: '',
        percnet: 0,
        unit: '',
      },
      isHistoryDate: true,
      quota: {
        itemDay: '',
        itemTitle: '',
        itemValue: 0,
        itemValueThousand: '',
        percnet: 0,
        unit: '',
      },
      startTitle: '',
    };
    const quotaBalance: EnergyConservationAssess.QuotaBalance = {
      legendData: [],
      quotaType: 0,
      selectYear: 0,
      seriesData: [
        {
          data: [],
          dataThousand: [],
          name: '',
          smooth: true,
          type: '',
        },
      ],
      unit: '',
      xaxisData: [],
      yunit: '',
    };
    const conclusion: EnergyConservationAssess.Conclusion = {
      proposeInfo: '',
      consumeStatistics: [],
    };
    const trendAnalysis: EnergyConservationAssess.QuotaBalance = {
      legendData: [],
      quotaType: 0,
      selectYear: 0,
      seriesData: [
        {
          data: [],
          dataThousand: [],
          name: '',
          smooth: true,
          type: '',
        },
      ],
      unit: '',
      xaxisData: [],
      yunit: '',
    };
    const initialData: Ref<EnergyConservationAssess.EnergyConservationHeaderParams> = ref({
      energyCode: '',
      quotaType: quotaTypeList[0].value,
      quotaDate: new Date().toString(),
      treeIds: [],
    });
    const conservationState = reactive<EnergyConservationState>({
      expandedKeys: [],
      energyCodeList: [],
      treeList: [],
      loading: false,
      treeLoading: false,
      searchTimeType: quotaTypeList[0].value,
      unit: 'kWh',
      searchParams: cloneDeep(initialData.value),
      usageProgress,
      conclusion,
      quotaBalance,
      trendAnalysis,
    });
    // 根据当前定额类型计算日期格式
    const currentDate = computed(() => {
      const { quotaType } = conservationState.searchParams;
      const month = new Date().getMonth() + 1;
      const date = new Date().getDate();
      return quotaType === 2 ? `${month}月${date}日` : `${date}日`;
    });
    /**
     * 跳转页面
     */
    const onPageTo = () => {
      sessionStorage.setItem('ems-energyConservationEnergyCode', '');
      sessionStorage.setItem('ems-kpiDingeType', '');
      sessionStorage.setItem('ems-energyName', '');
      openBlankUrl(energyConervationManageUrl);
    };
    /**
     * 切换treeType
     */
    const onTreeTypeChange = async () => {
      conservationState.searchParams.treeIds = [];
      await getTreeList();
    };
    /**
     * 切换分类分项
     */
    const onEnergyCodeChange = async () => {
      conservationState.searchParams.treeIds = [];
      await getTreeList();
    };
    /**
     * 重置数据
     */
    const onReset = async () => {
      conservationState.loading = true;
      if (conservationState.energyCodeList?.length === 0) {
        conservationState.loading = false;
        return;
      }
      conservationState.searchParams.energyCode = conservationState.energyCodeList[0].code;
      conservationState.searchParams.quotaType = quotaTypeList[0].value;
      treeType.value = treeTypeList[0].value;
      conservationState.searchParams.quotaDate = new Date().toString();
      await getTreeList();
      if (conservationState.treeList?.length === 0) {
        conservationState.conclusion = conclusion;
        conservationState.quotaBalance = quotaBalance;
        conservationState.trendAnalysis = trendAnalysis;
        conservationState.usageProgress = usageProgress;
        conservationState.loading = false;
        return;
      }
      onQueryData();
    };
    /**
     * 请求分析对象树 数据
     */
    const getTreeList = async () => {
      const { energyCode, quotaType } = conservationState.searchParams;
      const quotaDate = calculateDateByType();
      conservationState.treeLoading = true;
      try {
        const res = await energyConservationService.getEnergyConservationTree({
          energyCode,
          quotaDate,
          quotaType,
          treeType: treeType.value,
        });
        if (res && res.code === 200) {
          if (res.data && res.data.kpiTreeList?.length) {
            conservationState.treeList = res.data?.kpiTreeList;
            conservationState.searchParams.treeIds = [res.data?.clickTree?.id];
            initialData.value.treeIds = [res?.data?.clickTree?.id];
          } else {
            conservationState.treeList = [];
            conservationState.searchParams.treeIds = [];
          }
        } else {
          conservationState.treeList = [];
          conservationState.searchParams.treeIds = [];
          initialData.value.treeIds = [];
          proxy.$message.error(res.message || '查询树失败');
        }
      } catch (error) {
        conservationState.treeList = [];
        conservationState.searchParams.treeIds = [];
        initialData.value.treeIds = [];
      } finally {
        conservationState.treeLoading = false;
      }
    };
    /**
     * 请求数据
     */
    const onQueryData = async () => {
      conservationState.searchTimeType = conservationState.searchParams.quotaType;
      const { energyCode, quotaType, treeIds } = conservationState.searchParams;
      if (treeIds.length === 0 || conservationState.searchParams.treeIds?.length === 0) {
        proxy.$message.error('分析对象不能为空！');
        conservationState.loading = false;
        return;
      }
      try {
        conservationState.loading = true;
        const res: any = await energyConservationService.getEnergyConservationData({
          energyCode,
          quotaType,
          treeId: treeIds[0],
          quotaDate: calculateDateByType(),
        });

        if (res && res.code === 200) {
          if (res.data) {
            conservationState.conclusion = res.data.conclusion;
            conservationState.quotaBalance = res.data.quotaBalance;
            conservationState.trendAnalysis = res.data.trendAnalysis;
            conservationState.usageProgress = res.data.usageProgress;
            conservationState.unit = conservationState.usageProgress.benchUnit || 'kWh';
          } else {
            conservationState.conclusion = conclusion;
            conservationState.quotaBalance = quotaBalance;
            conservationState.trendAnalysis = trendAnalysis;
            conservationState.usageProgress = usageProgress;
          }
          conservationState.loading = false;
        } else {
          conservationState.conclusion = conclusion;
          conservationState.quotaBalance = quotaBalance;
          conservationState.trendAnalysis = trendAnalysis;
          conservationState.usageProgress = usageProgress;
          conservationState.loading = false;
        }
      } catch (error) {
        proxy.$message.error('查询失败，网络不佳');
        conservationState.loading = false;
      } finally {
        conservationState.loading = false;
      }
    };
    /**
     * 处理时间
     * quotaType为1时，时间传yyyy-MM；为2时，传yyyy
     */
    const calculateDateByType = () => {
      const { quotaType, quotaDate } = conservationState.searchParams;
      return formatDate(new Date(quotaDate), quotaType === 1 ? 'yyyy-MM' : 'yyyy');
    };
    /**
     * 处理日期禁用回调
     */
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    /**
     * 生成echarts配置模块
     */
    const echartsOptionModule = () => {
      const icons = [
        'rect',
        'rect',
        EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON,
        EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
      ];
      // 每日分析颜色
      const DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR = ['#D91026', '#1890ff', '#1890ff', '#ff9120'];
      // 趋势分析颜色
      const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR = ['#3681FF', '#FF9120', '#D91026'];
      // 主题
      const theme = computed(() => {
        return store.getters.theme || 'light';
      });
      /**
       * 获取legend
       */
      const getLegendData = (): GlobalModule.CommonObject => {
        const dataRect = [];
        const data = [];
        for (let i = 0; i < conservationState.quotaBalance.legendData.length; i++) {
          // if (i < 2) {
          dataRect.push({
            name: EchartsConfig.echartsUtils.resetName(i + 1, conservationState.quotaBalance.legendData[i]),
            icon: icons[i],
            itemStyle: {
              color: DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[i],
            },
            textStyle: {
              color: DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[i],
            },
          });
          // } else {
          //   data.push({
          //     name: EchartsConfig.echartsUtils.resetName(i + 1, conservationState.quotaBalance.legendData[i]),
          //     icon: icons[i],
          //     itemStyle: {
          //       color: DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[i],
          //     },
          //     textStyle: {
          //       color: DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[i],
          //     },
          //   });
          // }
        }
        return [
          {
            ...EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION,
            ...{
              data: dataRect,
              itemGap: 24,
              top: 10,
              itemHeight: 8,
              left: '35%',
            },
          },
          // {
          //   ...{ data, itemGap: 24, top: 10, left: '50%' },
          //   ...EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION,
          // },
        ];
      };
      /**
       * 获取柱状图配置
       */
      const getBarOption = (seriesData: EnergyConservationAssess.SeriesData, index: number, color: string) => {
        const { name, data, type } = seriesData;
        return {
          name: EchartsConfig.echartsUtils.resetName(index + 1, name),
          type,
          stack: 'Total',
          barWidth: 12,
          data,
          itemStyle: {
            color,
          },
        };
      };
      /**
       * 获取折线图配置
       * 区分只有一条数据
       */
      const getLineOption = (
        seriesData: EnergyConservationAssess.SeriesData,
        index: number,
        color: string,
      ): GlobalModule.CommonObject => {
        const { name, data, type } = seriesData;
        return {
          name: EchartsConfig.echartsUtils.resetName(index + 1, name),
          type,
          data: EchartsConfig.echartsUtils.getDataIsShowDot(data, color),
          symbolSize: 16,
          symbol: 'circle',
          showSymbol: true,
          color,
          emphasis: {
            lineStyle: {
              width: 2,
            },
            itemStyle: EchartsConfig.echartsUtils.getsymbolStyle(color),
          },
          lineStyle: {
            width: 2,
            type: index === 2 ? 'dashed' : 'solid',
          },
        };
      };
      /**
       * 获取series配置
       */
      const getSeriesOption = (): GlobalModule.CommonObject => {
        let series: GlobalModule.CommonObject[] = [];
        if (
          conservationState.quotaBalance.seriesData &&
          Array.isArray(conservationState.quotaBalance.seriesData) &&
          conservationState.quotaBalance.seriesData.length === 4
        ) {
          const barNegativeOption = getBarOption(
            conservationState.quotaBalance.seriesData[0],
            0,
            DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[0],
          );
          const barOption = getBarOption(
            conservationState.quotaBalance.seriesData[1],
            1,
            DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[1],
          );
          const dailyQuotaLineSeriesOption = getLineOption(
            conservationState.quotaBalance.seriesData[2],
            2,
            DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[2],
          );
          const dailyCostLineSeriesOption = getLineOption(
            conservationState.quotaBalance.seriesData[3],
            3,
            DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR[3],
          );
          series = [barNegativeOption, barOption, dailyQuotaLineSeriesOption, dailyCostLineSeriesOption];
        }

        return series;
      };
      /**
       * 每日分析配置
       */
      const getDailyAssessEchartsOption = () => {
        const dailyEchartsOption: EChartsOption = {
          color: DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR,
          tooltip: formatTooltipUtils(
            DAILY_MARGIN_ANALYSIS_CHART_LEGEND_TEXT_COLOR,
            conservationState.unit,
            conservationState.quotaBalance.selectYear,
            1,
            conservationState.quotaBalance.xaxisData,
          ),
          legend: getLegendData(),
          grid: EchartsConfig.echartsOption(theme.value).ECHARTS_COMMON_GRID_OPTION,
          xAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
            data: conservationState.quotaBalance.xaxisData,
          }),
          yAxis: EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION,
          series: getSeriesOption(),
        };

        console.log('dailyEchartsOption-------', dailyEchartsOption);
        return dailyEchartsOption;
      };
      /**
       * 获取趋势分析配置
       */
      const getTendencyAnalysisOption = () => {
        const option: EChartsOption = {
          color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR,
          tooltip: {
            ...formatTooltipUtils(
              TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR,
              conservationState.unit,
              conservationState.quotaBalance.selectYear,
              2,
              conservationState.trendAnalysis.xaxisData,
            ),
          },
          legend: getTendencyLegendData(),
          grid: EchartsConfig.echartsOption(theme.value).ECHARTS_COMMON_GRID_OPTION,
          xAxis: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
            data: conservationState.trendAnalysis.xaxisData,
          }),
          yAxis: EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION,
          series: getTendencySeriesOption(),
        };
        return option;
      };
      /**
       * 获取legend
       */
      const getTendencyLegendData = (): GlobalModule.CommonObject => {
        const { legendData } = conservationState.trendAnalysis;
        const data = [];
        for (let i = 0; i < legendData.length; i++) {
          data.push({
            name: legendData[i],
            icon: i === 2 ? EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON : 'rect',
            textStyle: {
              color: TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[i],
            },
          });
        }
        return {
          ...{ data, itemGap: 24, top: 10 },
          ...EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION,
        };
      };
      /**
       * 获取series配置
       */
      const getTendencySeriesOption = (): GlobalModule.CommonObject => {
        const { seriesData } = conservationState.trendAnalysis;
        return seriesData?.length && seriesData?.[0]?.name
          ? seriesData?.map((item: any, index: number) => {
              const { data, name, type } = item;
              return {
                name,
                type,
                symbol: 'circle',
                showSymbol: true,
                symbolSize: 16,
                data: data?.length
                  ? EchartsConfig.echartsUtils.getDataIsShowDot(data, TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index])
                  : [],
                emphasis: {
                  scale: false,
                  itemStyle:
                    index !== 2
                      ? EchartsConfig.echartsUtils.getsymbolStyle(TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR[index])
                      : null,
                },
                lineStyle: {
                  width: 2,
                  type: index < 2 ? 'solid' : 'dashed',
                },
              };
            })
          : [];
      };

      return { getDailyAssessEchartsOption, getTendencyAnalysisOption };
    };
    const { getDailyAssessEchartsOption, getTendencyAnalysisOption } = echartsOptionModule();
    /**
     * 初始化
     */
    onMounted(async () => {
      let params;
      /**
       * 处理能耗异常本地缓存
       */
      if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
        params = JSON.parse(JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))));
        treeType.value = params.treeType;
      }

      conservationState.loading = true;
      try {
        const res = await queryEnergyFlagOneExcludeTotalTree();
        if (res && res?.length) {
          conservationState.energyCodeList = res;
          conservationState.searchParams.energyCode = params && params.energyCode ? params.energyCode : res[0].code;
          initialData.value.energyCode = res[0].code;
          if (params && params?.treeId) {
            if (params.transferDate) {
              conservationState.searchParams.quotaDate = formatDate(
                subDays(new Date(params.transferDate), 1),
                'yyyy-MM-dd',
              );
            } else {
              conservationState.searchParams.quotaDate = formatDate(subDays(new Date(), 1), 'yyyy-MM-dd');
            }
          }

          await getTreeList();

          if (params && params?.treeType !== treeType.value) {
            await getTreeList();
          }
          if (params && params?.treeId) {
            if (params.transferDate) {
              conservationState.searchParams.quotaDate = formatDate(
                subDays(new Date(params.transferDate), 1),
                'yyyy-MM-dd',
              );
            } else {
              conservationState.searchParams.quotaDate = formatDate(subDays(new Date(), 1), 'yyyy-MM-dd');
            }
            conservationState.searchParams.treeIds = [params?.treeId];
          }
          if (conservationState.searchParams.treeIds?.length === 0) {
            conservationState.loading = false;
            return;
          }
          window.sessionStorage.removeItem('ems-energyAbnormalParams');
          await onQueryData();
          conservationState.loading = false;
        } else {
          conservationState.energyCodeList = [];
          conservationState.loading = false;
        }
      } catch (error) {
        conservationState.loading = false;
      } finally {
        conservationState.loading = false;
      }
    });
    return {
      ...toRefs(conservationState),
      treeType,
      defaultTreeProps,
      quotaTypeList,
      treeTypeList,
      currentDate,
      getDailyAssessEchartsOption,
      getTendencyAnalysisOption,
      onPageTo,
      onQueryData,
      getTreeList,
      onReset,
      onTreeTypeChange,
      onDisableDateCb,
      onEnergyCodeChange,
    };
  },
});
