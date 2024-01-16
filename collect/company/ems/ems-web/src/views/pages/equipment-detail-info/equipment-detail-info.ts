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
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *            佛祖保佑                永无BUG
 */
import { defineComponent, reactive, toRefs, computed, ref, onMounted, nextTick } from 'vue';
// config
import echartConfig from '@/config/echarts/index';
// util
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import { FGetQueryParam } from '@/utils/token';
import { thousandSeparation, onScroll, formatDate } from '@/utils/index';
// service
import equipmentDetailInfoService from '@/views/pages/equipment-detail-info/services/equipment-detail-info.service';
import commonService from '@/services/common/common.service';
import { isToday } from 'date-fns';

interface InfoState {
  exportVisible: boolean;
  exportLoading: boolean;
  chartLoading: boolean;
  tableLoading: boolean;
  showChartNoData: boolean;
  showTableNoData: boolean;
  unit: string;
  serialNumber: string;
  exportDate: Date[];
  queryForm: IEquipmentDetailInfo.QueryForm;
  equipmentInfo: IEquipmentDetailInfo.EquipmentInfo;
  equipmentChart: IEquipmentDetailInfo.EquipChartInfo;
  equipmentTable: IEquipmentDetailInfo.EquipmentTableInfo;
  dataSource: IEquipmentDetailInfo.EquipmentTableDataSource[];
}

export default defineComponent({
  name: 'equipmentDetailInfo',
  setup() {
    // 工具对象
    const store = useStore();
    const route = useRoute();
    // 公共请求
    const { getServerDate } = useCommonController();
    const { proxy } = useCurrentInstance();
    const currentDate = ref();
    let mergeArrUnit = '';
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
    const infoState = reactive<InfoState>({
      exportVisible: false,
      exportLoading: false,
      chartLoading: false,
      tableLoading: false,
      showChartNoData: false,
      showTableNoData: false,
      exportDate: [],
      serialNumber: '',
      queryForm: {
        queryTime: null,
        paramId: undefined,
      },
      unit: '',
      equipmentInfo: {
        address: '',
        havcSystemParamList: [],
        id: 0,
        manufactureDate: '',
        manufacturer: '',
        model: '',
        name: '',
        number: '',
        proDeviceTypeName: '',
        ratedPower: '',
        ratedPowerUnit: '',
        status: '',
        system: '',
      },
      equipmentChart: {
        xaxisTimes: [],
        seriesData: [],
      },
      equipmentTable: {
        tableDetailList: [],
        havcSystemParamTitleList: [],
      },
      dataSource: [],
    });
    // 服务器时间
    const serverDate = ref();
    // 主题
    const theme = computed(() => {
      return store && store.getters && store.getters.theme ? store.getters.theme : 'light';
    });
    // 设备id
    const deviceId = computed(() => {
      return FGetQueryParam('deviceId') as string;
    });
    /**
     *
     * @param date
     * @returns
     */
    onMounted(async () => {
      try {
        infoState.chartLoading = true;
        infoState.tableLoading = true;
        infoState.showChartNoData = false;
        infoState.showTableNoData = false;
        serverDate.value = await getServerDate();
        infoState.queryForm.queryTime = new Date(serverDate.value);
        currentDate.value = infoState.queryForm.queryTime;
        await getEquipmentDetail();
        if (infoState.equipmentInfo.havcSystemParamList?.length === 0) {
          infoState.chartLoading = false;
          infoState.tableLoading = false;
          infoState.showChartNoData = true;
          infoState.showTableNoData = true;
          return;
        }
        getEquipmentChart();
        getEquipmentTable();
      } catch (error) {
        infoState.chartLoading = false;
        infoState.tableLoading = false;
        infoState.showChartNoData = true;
        infoState.showTableNoData = true;
      }
    });
    // 日期禁用
    const disabledDate = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    // 查询表单提交
    const onSubmit = async () => {
      if (infoState.chartLoading) {
        return;
      }
      if (infoState.tableLoading) {
        return;
      }
      if (!infoState.queryForm.queryTime) {
        proxy.$message.error('请选择日期！');
        return;
      }
      getEquipmentChart();
      currentDate.value = infoState.queryForm.queryTime;
      getEquipmentTable();
    };
    // 重置
    const onReset = async () => {
      if (infoState.chartLoading) {
        return;
      }
      if (infoState.tableLoading) {
        return;
      }
      infoState.queryForm.queryTime = new Date(serverDate.value);
      console.log(infoState.equipmentInfo.havcSystemParamList);
      infoState.queryForm.paramId = infoState.equipmentInfo.havcSystemParamList?.length
        ? infoState.equipmentInfo.havcSystemParamList[0].id
        : undefined;
      infoState.serialNumber = infoState.equipmentInfo.havcSystemParamList?.length
        ? infoState.equipmentInfo.havcSystemParamList[0].serialNumber
        : '';
      getEquipmentChart();
      currentDate.value = infoState.queryForm.queryTime;
      getEquipmentTable();
    };
    // 查询设备详情
    const getEquipmentDetail = async () => {
      infoState.chartLoading = true;
      infoState.tableLoading = true;
      try {
        const res = await equipmentDetailInfoService.getEquipmentDetail(deviceId.value);
        if (res && res.code === 200 && res.data) {
          infoState.equipmentInfo = res.data;
          infoState.queryForm.paramId = res.data.havcSystemParamList?.length ? res.data.havcSystemParamList[0].id : '';
          infoState.unit = res.data.havcSystemParamList?.length ? res.data.havcSystemParamList[0].unit : '';
          infoState.serialNumber = res.data.havcSystemParamList?.length
            ? res.data.havcSystemParamList[0].serialNumber
            : '';
        } else {
          infoState.serialNumber = '';
          infoState.unit = '';
          infoState.equipmentInfo = {
            address: '',
            havcSystemParamList: [],
            id: 0,
            manufactureDate: '',
            manufacturer: '',
            model: '',
            name: '',
            number: '',
            proDeviceTypeName: '',
            ratedPower: '',
            ratedPowerUnit: '',
            status: '',
            system: '',
          };
          infoState.queryForm.paramId = undefined;
          infoState.chartLoading = false;
          infoState.tableLoading = false;
        }
      } catch (error) {
        infoState.serialNumber = '';
        infoState.queryForm.paramId = undefined;
        infoState.unit = '';
        infoState.equipmentInfo = {
          address: '',
          havcSystemParamList: [],
          id: 0,
          manufactureDate: '',
          manufacturer: '',
          model: '',
          name: '',
          number: '',
          proDeviceTypeName: '',
          ratedPower: '',
          ratedPowerUnit: '',
          status: '',
          system: '',
        };
        infoState.chartLoading = false;
        infoState.tableLoading = false;
        infoState.showChartNoData = true;
        infoState.showTableNoData = true;
      }
    };
    // 查询echart数据
    const getEquipmentChart = async () => {
      if (infoState.equipmentInfo.havcSystemParamList.length === 0) {
        return;
      }
      infoState.chartLoading = true;
      infoState.showChartNoData = false;
      const { queryTime } = infoState.queryForm;
      try {
        const istoday = isToday(new Date(queryTime));
        const res = await equipmentDetailInfoService.getEquipmentChartData({
          endTime: istoday
            ? formatDate(new Date(queryTime), 'yyyy-MM-dd HH:mm')
            : `${formatDate(new Date(queryTime), 'yyyy-MM-dd')} 23:59`,
          startTime: `${formatDate(new Date(queryTime), 'yyyy-MM-dd')} 00:00`,
          serialNumber: infoState.serialNumber,
          deviceId: deviceId.value,
        });
        if (res && res.code === 200 && res.data) {
          infoState.equipmentChart = res.data;
        } else {
          infoState.equipmentChart.seriesData = [];
          infoState.showChartNoData = true;
        }
      } catch (error) {
        infoState.showChartNoData = true;
        console.warn('---------error------------------>', error);

        proxy.$message.error('查询失败，网络不佳');
        infoState.equipmentChart.seriesData = [];
      } finally {
        infoState.chartLoading = false;
      }
    };
    // 查询表格数据
    const getEquipmentTable = async () => {
      const { queryTime } = infoState.queryForm;
      infoState.tableLoading = true;
      infoState.showTableNoData = false;
      try {
        const istoday = isToday(new Date(queryTime));
        const res = await equipmentDetailInfoService.getEquipmentTableData({
          startTime: `${formatDate(new Date(queryTime), 'yyyy-MM-dd')} 00:00`,
          endTime: istoday
            ? formatDate(new Date(queryTime), 'yyyy-MM-dd HH:mm')
            : `${formatDate(new Date(queryTime), 'yyyy-MM-dd')} 23:59`,
          serialNumber: infoState.serialNumber,
          deviceId: deviceId.value,
        });
        if (res && res.success && res.data) {
          infoState.dataSource = [];
          infoState.equipmentTable = res.data;
          if (res.data.tableDetailList?.length) {
            res.data.tableDetailList.forEach((item: string[], index: number) => {
              item.forEach((childItem, childIndex) => {
                infoState.dataSource[index] = {
                  ...infoState.dataSource[index],
                  [`value${childIndex}`]: childItem,
                };
              });
            });
            /**
             * 监听滚动处理tooltip
             */
            if (res.data.tableDetailList?.length > 10) {
              nextTick(() => {
                (document.querySelector('.el-table__body-wrapper') as HTMLElement).addEventListener('scroll', onScroll);
              });
            } else {
              if (document.querySelector('.el-table__body-wrapper')) {
                (document.querySelector('.el-table__body-wrapper') as HTMLElement).removeEventListener(
                  'scroll',
                  onScroll,
                );
              }
            }
          } else {
            infoState.equipmentTable.havcSystemParamTitleList = [];
            infoState.equipmentTable.tableDetailList = [];
            infoState.dataSource = [];
            infoState.showTableNoData = true;
          }
        } else {
          infoState.equipmentTable.havcSystemParamTitleList = [];
          infoState.equipmentTable.tableDetailList = [];
          infoState.dataSource = [];
          infoState.showTableNoData = true;
        }
      } catch (error) {
        infoState.equipmentTable.havcSystemParamTitleList = [];
        infoState.equipmentTable.tableDetailList = [];
        infoState.dataSource = [];
        infoState.showTableNoData = true;
      } finally {
        infoState.tableLoading = false;
      }
    };
    /**
     * 下拉框
     * @param value 切换参数
     */
    const onFilterParamChange = async () => {
      infoState.equipmentInfo.havcSystemParamList.forEach(item => {
        if (item.id === infoState.queryForm.paramId) {
          infoState.unit = item.unit;
          infoState.serialNumber = item.serialNumber;
        }
      });
      await getEquipmentChart();
    };
    // 获取x轴数据
    const getxAxisData = () => {
      return infoState.equipmentChart.xaxisTimes?.length
        ? infoState.equipmentChart.xaxisTimes.map(item => {
            return formatDate(item, 'HH:mm');
          })
        : [];
    };
    // 初始化echarts
    const onInitCharts = () => {
      if (infoState.equipmentChart.seriesData?.length === 0) {
        return;
      }
      const unit = infoState.unit;
      let mergeArrMaxNum: any = infoState.equipmentChart.seriesData.reduce((a, b) => {
        return b > a ? b : a;
      });
      if (mergeArrMaxNum !== '--' && mergeArrMaxNum !== '' && mergeArrMaxNum !== null && mergeArrMaxNum !== undefined) {
        mergeArrMaxNum = Number(mergeArrMaxNum);
        if (mergeArrMaxNum?.toFixed(0).length > 5 && mergeArrMaxNum?.toFixed(0).length < 8) {
          mergeArrUnit = 'k';
        } else if (mergeArrMaxNum?.toFixed(0).length >= 8 && mergeArrMaxNum?.toFixed(0).length < 11) {
          mergeArrUnit = 'M';
        } else if (mergeArrMaxNum?.toFixed(0).length >= 11 && mergeArrMaxNum?.toFixed(0).length < 14) {
          mergeArrUnit = 'G';
        } else if (mergeArrMaxNum?.toFixed(0).length >= 14 && mergeArrMaxNum?.toFixed(0).length < 17) {
          mergeArrUnit = 'T';
        } else if (mergeArrMaxNum?.toFixed(0).length >= 17 && mergeArrMaxNum?.toFixed(0).length < 20) {
          mergeArrUnit = 'P';
        } else if (mergeArrMaxNum?.toFixed(0).length >= 20) {
          mergeArrUnit = 'E';
        }
      }

      const options = {
        color: echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR,
        title: {
          text: `单位${unit ? `（${unit}）` : ''}`,
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
            let htmlStr = `<span style="margin-bottom:10px">${formatDate(
              new Date(currentDate.value),
              'yyyy-MM-dd',
            )} ${params[0]?.axisValue || '--'}</span></br>`;
            params.forEach((item: any) => {
              htmlStr += `<span style="line-height:23px">
                            <span style="display:inline-block;padding-right:6px">${item.seriesName || '--'}：
                            </span>
                            ${thousandSeparation(item.value) ?? '--'}
                            <span style="display:inline-block">${
                              Object.prototype.toString.call(item.value) !== '[object Null]' &&
                              Object.prototype.toString.call(item.value) !== '[object Undefined]' &&
                              item.value !== '--' &&
                              unit
                                ? unit
                                : ''
                            }
                            </span>
                            </span>
                            </br>`;
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
          data: getxAxisData(),
        }),
        yAxis: {
          type: 'value',
          offset: 0,
          axisLine: {
            show: true,
            lineStyle: {
              color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR,
            },
          },
          axisTick: {
            lineStyle: {
              color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            },
            length: 2,
          },
          axisLabel: {
            color: echartConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
            fontSize: echartConfig.echartsConstant.CHARTS_FONT_SIZE_14,
            lineHeight: 22,
            formatter(value: number, index: number) {
              let texts;
              if (mergeArrUnit === 'k') {
                texts = Number(value / 1000) + 'k';
              } else if (mergeArrUnit === 'M') {
                texts = Number(value / 1000000) + 'M';
              } else if (mergeArrUnit === 'G') {
                texts = Number(value / 1000000000) + 'G';
              } else if (mergeArrUnit === 'T') {
                texts = Number(value / 1000000000000) + 'T';
              } else if (mergeArrUnit === 'P') {
                texts = Number(value / 1000000000000000) + 'P';
              } else if (mergeArrUnit === 'E') {
                texts = Number(value / 1000000000000000000) + 'E';
              } else {
                texts = Number(value);
              }
              return texts;
            },
          },
          splitLine: {
            show: true,
          },
          boundaryGap: [0, 0.01],
        },
        series: [
          {
            name: '实际值',
            type: 'line',
            stack: 'actualValue',
            itemStyle: {
              borderWidth: 20,
            },
            symbol: 'circle',
            showSymbol: true,
            symbolSize: 16,
            emphasis: {
              scale: false,
              itemStyle: echartConfig.echartsUtils.getsymbolStyle(
                echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0],
              ),
            },
            data: echartConfig.echartsUtils.getDataIsShowDot(
              infoState.equipmentChart.seriesData,
              echartConfig.echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR[0],
            ),
          },
        ],
      };
      return options;
    };
    // 导出弹框
    const onExport = () => {
      if (infoState.exportLoading) {
        return;
      }
      infoState.exportVisible = true;
      infoState.exportDate = [new Date(serverDate.value), new Date(serverDate.value)];
    };
    // 确认导出
    const onExportSubmit = () => {
      if (!infoState.exportDate || infoState.exportDate?.length === 0) {
        proxy.$message.error('请选择时间');
        return;
      }
      if (infoState.exportLoading) {
        return;
      }
      infoState.exportLoading = true;
      let serialNumber = '';
      infoState.equipmentInfo.havcSystemParamList.forEach(item => {
        if (item.id === infoState.queryForm.paramId) {
          serialNumber = item.serialNumber;
        }
      });
      const istoday = isToday(new Date(formatDate(infoState.exportDate[1], 'yyyy-MM-dd HH:mm')));
      infoState.exportVisible = false;
      commonService.getFileStreamDownload<IEquipmentDetailInfo.EquipmentExportParams>(
        {
          endTime: !istoday
            ? `${formatDate(infoState.exportDate[1], 'yyyy-MM-dd')} 23:59`
            : formatDate(new Date(), 'yyyy-MM-dd HH:mm'),
          startTime: `${formatDate(infoState.exportDate[0], 'yyyy-MM-dd')} 00:00`,
          serialNumber,
          deviceId: deviceId.value,
        },
        '/deviceDetail/exportHavcSystemTableVO',
        '导出',
        () => {
          infoState.exportLoading = false;
        },
        () => {
          infoState.exportLoading = false;
        },
      );
    };
    // 取消导出
    const onCancel = () => {
      infoState.exportVisible = false;
    };
    return {
      ...toRefs(infoState),
      deviceId,
      disabledDate,
      onSubmit,
      onReset,
      onInitCharts,
      onFilterParamChange,
      onExport,
      onExportSubmit,
      onCancel,
      thousandSeparation,
    };
  },
});
