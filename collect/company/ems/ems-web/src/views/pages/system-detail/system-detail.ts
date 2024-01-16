/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *            佛祖保佑               永无BUG
 */
import { defineComponent, reactive, toRefs, onMounted, ref, computed, nextTick } from 'vue';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import { useStore } from 'vuex';
import { thousandSeparation, formatDate, onScroll } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
// config
import echartConfig from '@/config/echarts/index';
// service
import systemDetailService from './services/system-detail.service';
import commonService from '@/services/common/common.service';

interface SystemDetailState {
  tableLoading: boolean;
  chartLoading: boolean;
  exportLoading: boolean;
  exportVisible: boolean;
  searchSystemName: string;
  exportDate: Date[];
  errorFlag: boolean;
  queryForm: ISystemDetail.QueryForm;
  systemList: ISystemDetail.SystemInfo[];
  paramList: ISystemDetail.SystemParamInfo[];
  systemChartVO: ISystemDetail.SystemChartVO;
  systemTableVO: ISystemDetail.SystemTableVO;
  dataSource: GlobalModule.CommonObject[];
}

export default defineComponent({
  name: 'SystemDetail',
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    const { getServerDate } = useCommonController();
    // emphasis样式
    const symbolStyle: { [key: string]: any } = {
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
            color: '#3681FF',
          },
          {
            offset: 0.5,
            color: '#3681FF',
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
            color: '#3681FF',
          },
        ],
      },
    };
    // 提示语
    const errorMessage = ref('暂无数据');
    // 当前时间
    const currentDate = ref();
    // 服务器时间
    const serverDate = ref();
    const systemState = reactive<SystemDetailState>({
      chartLoading: true,
      tableLoading: true,
      exportLoading: false,
      exportVisible: false,
      exportDate: [],
      errorFlag: false,
      searchSystemName: '',
      queryForm: {
        systemId: undefined,
        systemName: '',
        paramId: undefined,
        paramName: '',
        date: null,
        serialNumber: '',
        paramUnit: '',
      },
      systemList: [],
      paramList: [],
      systemChartVO: {
        timeList: [],
        valueList: [],
      },
      systemTableVO: {
        proSystemParamTitleList: [],
        proSystemParamValueList: [],
      },
      dataSource: [],
    });
    // 主题
    const theme = computed(() => {
      return store && store.getters && store.getters.theme ? store.getters.theme : 'light';
    });
    /**
     *
     * @param d
     * @returns
     */
    const disabledDate = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    // 初始化
    onMounted(async () => {
      await onInit();
    });
    // 头部表单提交
    const onSubmit = async () => {
      if (systemState.tableLoading) {
        return;
      }
      if (systemState.chartLoading) {
        return;
      }
      if (systemState.systemList?.length === 0) {
        return;
      }
      if (!systemState.queryForm.date) {
        proxy.$message.error('请选择日期！');
        return;
      }
      systemState.errorFlag = false;
      systemState.searchSystemName = systemState.queryForm.systemName;
      await getParamListBySystemId();
      getSystemTable();
      if (systemState.paramList?.length === 0) {
        return;
      }
      currentDate.value = systemState.queryForm.date;
      getSystemChart();
    };
    // 重置
    const onReset = async () => {
      if (systemState.tableLoading) {
        return;
      }
      if (systemState.chartLoading) {
        return;
      }
      if (systemState.systemList?.length === 0) {
        return;
      }
      systemState.queryForm.systemId = systemState.systemList?.length ? systemState.systemList[0].id : undefined;
      systemState.queryForm.systemName = systemState.systemList?.length ? systemState.systemList[0].name : '';
      systemState.searchSystemName = systemState.queryForm.systemName;

      systemState.queryForm.date = new Date(serverDate.value);
      await getParamListBySystemId();
      getSystemTable();
      if (systemState.paramList?.length === 0) {
        return;
      }
      currentDate.value = systemState.queryForm.date;
      getSystemChart();
    };
    // 初始化
    const onInit = async () => {
      try {
        errorMessage.value = '暂无数据';
        const date = await getServerDate();
        serverDate.value = date;
        systemState.queryForm.date = new Date(date);
        currentDate.value = systemState.queryForm.date;

        await getSystemDataList();
        if (systemState.systemList?.length === 0) {
          return;
        }
        await getParamListBySystemId();
        getSystemTable();
        if (systemState.paramList?.length === 0) {
          return;
        }
        getSystemChart();
      } catch (error) {
        serverDate.value = new Date();
        systemState.queryForm.date = new Date();
        systemState.chartLoading = false;
        systemState.tableLoading = false;
      }
    };
    // 获取系统列表
    const getSystemDataList = async () => {
      try {
        systemState.chartLoading = true;
        systemState.tableLoading = true;
        const res = await systemDetailService.getSystemList();
        if (res && res.code === 200 && res.data) {
          if (res.data?.length) {
            systemState.systemList = res.data;
            systemState.queryForm.systemId = res.data?.length ? res.data[0].id : undefined;
            systemState.queryForm.systemName = res.data?.length ? res.data[0].name : '';
            systemState.searchSystemName = systemState.queryForm.systemName;
            errorMessage.value = '暂无数据';
          } else {
            errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
            systemState.errorFlag = true;
            systemState.systemList = [];
            systemState.queryForm.systemId = undefined;
            systemState.queryForm.systemName = '';
            systemState.queryForm.systemId = undefined;
          }
        } else {
          errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
          systemState.errorFlag = true;
          systemState.systemList = [];
          systemState.queryForm.systemId = undefined;
          systemState.queryForm.systemName = '';
          systemState.queryForm.systemId = undefined;
        }
      } catch (error) {
        errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
        systemState.errorFlag = true;
        systemState.systemList = [];
        systemState.queryForm.systemId = undefined;
      } finally {
        systemState.chartLoading = false;
        systemState.tableLoading = false;
      }
    };
    // 根据系统查询参数
    const getParamListBySystemId = async () => {
      if (systemState.queryForm.systemId) {
        try {
          let systemTypeQuery: string = '';
          systemState.systemList.filter((item: ISystemDetail.SystemInfo) => {
            if (item.id === systemState.queryForm.systemId) {
              return (systemTypeQuery = item.systemType);
            }
          });
          const params = {
            systemId: systemState.queryForm.systemId,
            systemType: systemTypeQuery,
          };
          systemState.chartLoading = true;
          systemState.tableLoading = true;
          const res = await systemDetailService.getSystemParamListBySystemId(params);
          if (res && res.code === 200 && res.data) {
            if (res.data?.length) {
              systemState.paramList = res.data;
              systemState.queryForm.paramId = res.data?.length ? res.data[0].id : undefined;
              systemState.queryForm.paramName = res.data?.length ? res.data[0].name : '';
              systemState.queryForm.serialNumber = res.data?.length ? res.data[0].serialNumber : '';
              systemState.queryForm.paramUnit = res.data?.length ? res.data[0].unit : '';
              errorMessage.value = '暂无数据';
              systemState.errorFlag = false;
            } else {
              errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
              systemState.errorFlag = true;
              systemState.chartLoading = false;
              systemState.tableLoading = false;
              systemState.paramList = [];
              systemState.systemChartVO = {
                valueList: [],
                timeList: [],
              };
              systemState.queryForm.paramId = undefined;
              systemState.queryForm.paramName = '';
              systemState.queryForm.serialNumber = '';
              systemState.queryForm.paramUnit = '';
            }
          } else {
            errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
            systemState.errorFlag = true;
            systemState.chartLoading = false;
            systemState.tableLoading = false;
            systemState.paramList = [];
            systemState.queryForm.paramId = undefined;
            systemState.queryForm.paramName = '';
          }
        } catch (error) {
          errorMessage.value = '未配置任何指标，请至专业系统配置功能配置';
          systemState.errorFlag = true;
          systemState.chartLoading = false;
          systemState.tableLoading = false;
          systemState.paramList = [];
          systemState.queryForm.paramId = undefined;
          systemState.queryForm.paramName = '';
        }
      }
    };
    // 查询chart数据
    const getSystemChart = async () => {
      if (systemState.queryForm.systemId && systemState.queryForm.paramId) {
        const { systemId, serialNumber, date } = systemState.queryForm;
        systemState.chartLoading = true;
        try {
          const res = await systemDetailService.getSystemChart({
            systemId: Number(systemId),
            serialNumber,
            startDate: formatDate(date, 'yyyy-MM-dd'),
            endDate: formatDate(date, 'yyyy-MM-dd'),
          });
          if (res && res.code === 200) {
            systemState.systemChartVO = res.data;
            systemState.chartLoading = false;
          } else {
            systemState.chartLoading = false;
            systemState.systemChartVO = res.data;
          }
        } catch (error) {
          systemState.chartLoading = false;
          systemState.systemChartVO = {
            timeList: [],
            valueList: [],
          };
        }
      }
    };
    // 查询表格数据
    const getSystemTable = async () => {
      if (systemState.queryForm.systemId) {
        systemState.tableLoading = true;
        const { systemId, date } = systemState.queryForm;
        let systemTypeQuery: string = '';
        systemState.systemList.filter((item: ISystemDetail.SystemInfo) => {
          if (item.id === systemId) {
            return (systemTypeQuery = item.systemType);
          }
        });
        try {
          const res = await systemDetailService.getSystemTable({
            systemId,
            startDate: formatDate(date, 'yyyy-MM-dd'),
            endDate: formatDate(date, 'yyyy-MM-dd'),
            systemType: systemTypeQuery,
          });
          if (res && res.code === 200) {
            systemState.dataSource = [];
            systemState.systemTableVO = res.data;
            if (res.data && res.data.proSystemParamValueList?.length) {
              res.data.proSystemParamValueList.forEach(item => {
                let newItem = {};
                item.forEach((childItem, childIndex) => {
                  newItem = {
                    ...newItem,
                    [`value${childIndex}`]: childItem,
                  };
                });
                systemState.dataSource.push(newItem);
              });

              /**
               * 监听滚动处理tooltip
               */
              if (res.data.proSystemParamValueList?.length > 10) {
                nextTick(() => {
                  (document.querySelector('.el-table__body-wrapper') as HTMLElement).addEventListener(
                    'scroll',
                    onScroll,
                  );
                });
              } else {
                if (document.querySelector('.el-table__body-wrapper')) {
                  (document.querySelector('.el-table__body-wrapper') as HTMLElement).removeEventListener(
                    'scroll',
                    onScroll,
                  );
                }
              }
            }
            systemState.tableLoading = false;
          } else {
            systemState.dataSource = [];
            systemState.tableLoading = false;
            errorMessage.value = '暂无数据';
          }
        } catch (error) {
          systemState.tableLoading = false;
          systemState.dataSource = [];
          errorMessage.value = '暂无数据';
        }
      }
    };
    // 系统change
    const onSystemChange = (value: number) => {
      systemState.systemList.forEach(item => {
        if (item.id === value) {
          systemState.queryForm.systemName = item.name;
        }
      });
    };
    // 参数变化
    const onFilterParamChange = async (value: number) => {
      systemState.paramList.forEach(item => {
        if (item.id === value) {
          systemState.queryForm.paramName = item.name;
          systemState.queryForm.paramUnit = item.unit;
          systemState.queryForm.serialNumber = item.serialNumber;
        }
      });
      await getSystemChart();
    };
    // 获取echarts配置
    const onInitCharts = () => {
      const unit = systemState.queryForm.paramUnit;

      const options = {
        color: echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR,
        title: {
          text: `单位${unit ? '（' + unit + '）' : ''}`,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            fontWeight: '400',
          },
          top: 20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: echartConfig.themeConstant[theme.value].CHARTS_TOOLTIP_BG_COLOR,
          padding: echartConfig.echartsConstant.CHARTS_TOOLTIP_PADDING,
          shadowColor: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_COLOR,
          shadowOffsetX: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX,
          shadowOffsetY: echartConfig.echartsConstant.CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY,
          textStyle: {
            color: echartConfig.themeConstant[theme.value].CHARTS_TOOLTIP_TEXT_COLOR,
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
          position: (
            point: any,
            params: any,
            dom: any,
            rect: any,
            size: { contentSize: [number, number]; viewSize: [number, number] },
          ) => {
            const x =
              +point[0] + size.contentSize[0] + 24 < size.viewSize[0]
                ? +point[0] + 12
                : +point[0] - 12 - size.contentSize[0];
            const y = (size.viewSize[1] - size.contentSize[1] + 22) / 2;
            return [x, y];
          },
          formatter: (params: any) => {
            let htmlStr = `<span style="margin-bottom:10px">${formatDate(currentDate.value, 'yyyy-MM-dd')} ${params[0]
              .axisValue || '--'}</span></br>`;
            params.forEach((item: any) => {
              htmlStr += `<span style="line-height:23px">
                                  <span style="display:inline-block">${item.seriesName ||
                                    '--'}：</span>${thousandSeparation(item.value) ??
                '--'}<span style="display:inline-block">${
                Object.prototype.toString.call(item.value) !== '[object Null]' &&
                Object.prototype.toString.call(item.value) !== '[object Undefined]' &&
                item.value !== '--' &&
                unit
                  ? unit
                  : ''
              }</span></span></br>`;
            });
            htmlStr += '</span>';
            return htmlStr;
          },
          enterable: true,
          renderMode: 'html',
          className: 'chart-tooltip-container',
        },
        legend: {
          type: 'scroll',
          itemWidth: 20,
          itemHeight: 2,
          icon: 'rect',
          itemGap: 60,
          data: [],
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '0%',
          containLabel: true,
        },
        xAxis: Object.assign(echartConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_CATEGORY_OPTION, {
          data: getXaxisData(),
        }),
        yAxis: echartConfig.echartsOption(theme.value).ECHARTS_LINECHART_AXIS_VALUE_OPTION,
        series: [
          {
            name: '实际值',
            type: 'line',
            stack: 'actualValue',
            emphasis: {
              scale: false,
              itemStyle: symbolStyle,
            },
            symbol: 'circle',
            showSymbol: true,
            symbolSize: 16,
            data: echartConfig.echartsUtils.getDataIsShowDot(systemState.systemChartVO.valueList, '#3681FF'),
          },
        ],
      };
      return options;
    };
    // 获取x轴数据
    const getXaxisData = () => {
      return systemState.systemChartVO.timeList?.length
        ? systemState.systemChartVO.timeList.map(item => {
            return formatDate(item, 'HH:mm');
          })
        : [];
    };
    // 表格导出
    const onTableExport = () => {
      if (systemState.chartLoading) {
        return;
      }
      if (systemState.tableLoading) {
        return;
      }
      if (systemState.exportLoading) {
        return;
      }
      systemState.exportVisible = true;
      systemState.exportDate = [new Date(serverDate.value), new Date(serverDate.value)];
    };
    // 确认导出
    const onExportSubmit = () => {
      if (!systemState.queryForm.systemId) {
        return;
      }
      if (!systemState.exportDate || systemState.exportDate?.length === 0) {
        proxy.$message.error('请选择日期');
        return;
      }
      if (systemState.exportLoading) {
        return;
      }
      let systemTypeQuery: string = '';
      systemState.systemList.filter((item: ISystemDetail.SystemInfo) => {
        if (item.id === systemState.queryForm.systemId) {
          return (systemTypeQuery = item.systemType);
        }
      });
      systemState.exportLoading = true;
      commonService.getFileStreamDownload<ISystemDetail.SystemExportParam>(
        {
          endDate: formatDate(systemState.exportDate[1], 'yyyy-MM-dd'),
          startDate: `${formatDate(systemState.exportDate[0], 'yyyy-MM-dd')}`,
          systemId: systemState.queryForm.systemId,
          systemName: systemState.queryForm.systemName,
          systemType: systemTypeQuery,
        },
        '/systemDetail/oneSystem/allParam/tableData/excel/export',
        '导出',
        () => {
          systemState.exportLoading = false;
        },
        () => {
          systemState.exportLoading = false;
        },
      );
      onCancel();
    };
    // 取消导出
    const onCancel = () => {
      systemState.exportVisible = false;
    };

    return {
      ...toRefs(systemState),
      errorMessage,
      currentDate,
      onSystemChange,
      onFilterParamChange,
      onSubmit,
      onReset,
      disabledDate,
      onInitCharts,
      onTableExport,
      thousandSeparation,
      onExportSubmit,
      onCancel,
    };
  },
});
