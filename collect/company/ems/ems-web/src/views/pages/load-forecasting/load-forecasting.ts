import { defineComponent, ref, onMounted, reactive, computed, watch } from 'vue';

import { useStore } from 'vuex';
import { cloneDeep } from 'lodash';
import { startOfMonth, differenceInDays, addMonths, endOfMonth } from 'date-fns';
import { formatDate, thousandSeparation } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import { useCommonController } from '@/utils/use-common-controller';
import { disabledProps, FGetElTreeDefaultProps } from '@/utils/token';

import CommonService from '@/services/common/common.service';
import getForecastDataUrl from './services/load-forecasting';
import { pageSizes } from '@/config/config';
import { TIMEUNIT } from '@/config/enum';
import url from '@/api/api-url';
import EnergyCodeService from '@/services/energycode-management/energycode-management.service';

import ProgresssLoad from './components/lf-progresses/lf-progresses.vue';
import EchartLine from './components/lf-echart-line/lf-echart-line.vue';
import message from '@/utils/message';

export interface TreeData {
  [key: string]: any;
}
export interface EchartsDataType {
  xaxis: number[];
  productArr: [];
  factArr: [];
  unit: string | null;
}
export interface FormType {
  energyType: Array<any>;
  date: any;
  timeUnit: string;
  switchSelect: number;
  radioValue: number;
  analysisObject: Array<any>;
}
export interface ItemType {
  value?: null | number;
  name: string;
}
export default defineComponent({
  components: {
    ProgresssLoad,
    EchartLine,
  },
  setup() {
    const store = useStore();
    const { proxy } = useCurrentInstance();
    const { getTreeListWithExpandKeys } = useCommonController();
    // 分析对象展开
    const analysisObjectExpanedKeys = ref<number[]>([]);
    // 查询树loading
    const treeLoading = ref<boolean>(false);
    let serverDate: Date;
    const timeUnitArr = ref<any[]>([]);
    const tableDataLoading = ref(true); // 列表数据loading图
    const formInline = reactive<FormType>({
      energyType: [],
      date: '',
      timeUnit: TIMEUNIT.ONE_DAY,
      switchSelect: 2,
      radioValue: 1,
      analysisObject: [],
    });
    let formInlineCopy: FormType; //深拷贝初始化的form表单 便于重置
    // 能源类型展开
    const energyTreeExpanedKeys = ref<number[]>([]);
    const analysisObjectData = ref<TreeData[]>([]);
    const radioData = proxy.$emsConfig.treeTypeList;
    // 能源类型
    const energyTreeData = ref<GlobalModule.CommonObject[]>([]);
    // 根据树类型---计算分类分项
    const computedEnergyCodeList = computed(() => {
      return formInline.radioValue === 2 && energyTreeData.value?.length
        ? energyTreeData.value.map((item) => {
            const newItem = cloneDeep(item);
            newItem.childEnergyCode = [];
            return newItem;
          })
        : energyTreeData.value;
    });
    const num = ref<number>(1);
    const product = ref<number | string>();
    const practical = ref<number | string>();
    let obj_copy: any = ref(); // 导出参数
    const echartsData: EchartsDataType = reactive({
      xaxis: [], // x轴数据
      productArr: [], // 预测数据
      factArr: [], // 实际数据
      unit: '', // 折线图单位
    });
    const unit = ref<string | null>(); // 表格单位
    const tableData = reactive<GlobalModule.CommonObject>({
      tableData: [],
    });
    const pageNum = ref<number>(1);
    const pageSize = ref<number>(pageSizes[0]);
    const total = ref<number>(0);
    // 导出loading
    const exportLoading = ref(false);
    // 赋值
    timeUnitArr.value = [{ label: '日', value: '1d' }];
    // 监听时间颗粒 来处理默认时间
    watch(
      () => formInline.timeUnit,
      (newVal: string) => {
        formInline.date = newVal === TIMEUNIT.ONE_DAY ? formInlineCopy.date : '';
      },
    );
    // 通过判断日间模式和黑夜模式来对列表的斑马纹做样式兼容
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    //区态、业态 按钮切换事件
    const treeRaidoChange = () => {
      if (formInline.energyType?.length === 0 || formInline.energyType[0] !== energyTreeData.value[0]) {
        formInline.energyType = energyTreeData.value?.length ? [energyTreeData.value[0].code] : [];
      }
      getAnalysisTreeData({
        energyCode: formInline.energyType[0],
        treeType: formInline.radioValue,
        expandLevel: 2,
      });
    };
    // 选择树节点事件
    const treeSelectChange = () => {
      console.log(formInline.analysisObject);
    };
    // 获取能源类型数据
    const getEnergyCodeData = async () => {
      try {
        const res = await EnergyCodeService.getAllEnergyCodeTree();
        if (res && res.code === 200 && res.success) {
          if (res.data && res.data.length > 0) {
            energyTreeData.value = res.data || [];
            formInline.energyType = res.data && res.data.length > 0 ? [res.data[0].code] : [];
          } else {
            energyTreeData.value = [];
            formInline.energyType = [];
          }
        } else {
          energyTreeData.value = [];
          formInline.energyType = [];
        }
      } catch (error) {
        energyTreeData.value = [];
        formInline.energyType = [];
      }
    };
    // 获取分析对象
    const getAnalysisTreeData = async (param: any) => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(param.treeType, formInline.energyType[0], 2);
        if (res?.data?.length) {
          analysisObjectData.value = res.data ?? [];
          analysisObjectExpanedKeys.value = res?.expandTreeIds ?? [];
          formInline.analysisObject = analysisObjectData.value?.length
            ? !analysisObjectData.value[0]?.lockFlag
              ? [analysisObjectData.value[0].id]
              : analysisObjectData.value[0]?.childTree?.length
              ? [analysisObjectData.value[0]?.childTree[0].id]
              : []
            : [];
        } else {
          analysisObjectData.value = [];
          formInline.analysisObject = [];
        }
      } catch (error) {
        analysisObjectData.value = [];
        formInline.analysisObject = [];
      } finally {
        treeLoading.value = false;
      }
    };
    // 初始化日期
    const pageInit = async () => {
      serverDate = await CommonService.getServerDate();
      const startMonth = startOfMonth(serverDate);
      let endDate = cloneDeep(serverDate);
      endDate = addMonths(endDate, 1);
      endDate = endOfMonth(endDate);
      formInline.date = [startMonth, endDate];
    };

    /* 请求数据 */
    const onSubmit = async () => {
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      if (!formInline.energyType.length) {
        tableDataLoading.value = false;
        return message.error('能源类型不能为空');
      }
      if (!formInline.analysisObject.length) {
        tableDataLoading.value = false;
        return message.error('分析对象不能为空');
      }
      if (!formInline.date) {
        tableDataLoading.value = false;
        return message.error('日期不能为空');
      }
      // 当时间颗粒为月 将选择月份 加一 因为组件选择的是当前月1号
      if (formInline.timeUnit === TIMEUNIT.ONE_MONTH) {
        const now = new Date(formInline.date[1]);
        const nowMonth = now.getMonth();
        const nowYear = now.getFullYear();
        formInline.date[1] = new Date(nowYear, nowMonth + 1, 0);
      }
      if (formInline.timeUnit === TIMEUNIT.ONE_DAY && differenceInDays(formInline.date[1], formInline.date[0]) > 90) {
        tableDataLoading.value = false;
        return message.error('负荷预测仅支持查询90天内的数据，请重新选择查询时间');
      } else if (
        formInline.timeUnit === TIMEUNIT.ONE_MONTH &&
        differenceInDays(formInline.date[1], formInline.date[0]) > 93
      ) {
        tableDataLoading.value = false;
        return message.error('负荷预测仅支持查询3个月内的数据，请重新选择查询时间');
      }

      const obj = {
        endTime: formatDate(formInline.date[1], 'yyyy-MM-dd') + ' 23:59',
        energyCode: formInline.energyType[0],
        startTime: formatDate(formInline.date[0], 'yyyy-MM-dd') + ' 00:00',
        timeUnit: formInline.timeUnit,
        treeId: formInline.analysisObject[0],
      };
      tableDataLoading.value = true;
      obj_copy = cloneDeep(obj); //深拷贝一下 因为查询后防止用户切换搜索条件 但不再查询 保证当前页面的查询与导出数据一致
      try {
        const res: any = await getForecastDataUrl.getForecastDataUrl(obj);
        if (res && res.code === 200 && res.success) {
          // 赋值
          product.value =
            res.data && res.data.forecastTotal && typeof res.data.forecastTotal === 'number'
              ? res.data.forecastTotal
              : '--';
          practical.value =
            res.data && res.data.historyTotal && typeof res.data.historyTotal === 'number'
              ? res.data.historyTotal
              : '--';
          num.value++;
          tableData.tableData = res.data.forecastDetails;
          total.value = res.data.forecastDetails.length;
          tableDataLoading.value = false;
          echartsData.xaxis = res.data.barChart.xaxisTimes;
          echartsData.productArr = res.data.barChart.barChartSeriesList[0].values.map((item: ItemType) => {
            return item.value;
          });
          echartsData.factArr = res.data.barChart.barChartSeriesList[1].values.map((item: ItemType) => {
            return item.value;
          });
          echartsData.unit = res.data.barChart.yaxisItemList[0].unit;
          unit.value = res.data.unit;
        } else {
          tableData.tableData = [];
          tableDataLoading.value = false;
        }
      } catch (error) {
        tableData.tableData = [];
        tableDataLoading.value = false;
      }
    };
    /* 重置 */
    const onReset = () => {
      Object.assign(formInline, formInlineCopy);
      pageNum.value = 1;
      pageSize.value = pageSizes[0];
      onSubmit();
    };
    // 导出
    const exportData = async () => {
      if (exportLoading.value) {
        return;
      }
      exportLoading.value = true;
      await CommonService.getFileStreamDownload(
        obj_copy,
        url.downLoad.loadForecastingExport,
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };
    // pagesize改变切换事件
    const onPageSizeChange = (value: number) => {
      pageSize.value = value;
    };
    // pagenum改变切换事件
    const onCurrentChange = (value: number) => {
      pageNum.value = Math.floor(value);
    };
    // 格式化数据明细列表
    const formatFact = (row: object, column: object, cellValue: any) => {
      return thousandSeparation(cellValue);
    };
    onMounted(async () => {
      try {
        await pageInit();
        await getEnergyCodeData();
        await getAnalysisTreeData({
          treeType: formInline.radioValue,
        });
        formInlineCopy = cloneDeep(formInline);
        if (formInline.energyType.length < 1) {
          tableDataLoading.value = false;
          return;
        }
        if (formInline.analysisObject.length < 1) {
          tableDataLoading.value = false;
          return;
        }
        await onSubmit();
      } catch (error) {
        tableDataLoading.value = false;
      }
    });
    return {
      TIMEUNIT,
      formInline,
      energyTreeData,
      computedEnergyCodeList,
      energyTreeExpanedKeys,
      analysisObjectData,
      analysisObjectExpanedKeys,
      exportLoading,
      radioData,
      tableDataLoading,
      pageNum,
      pageSize,
      tableData,
      treeLoading,
      total,
      product,
      practical,
      timeUnitArr,
      num,
      echartsData,
      lightOrDark,
      unit,
      pageSizes,
      disabledProps,

      FGetElTreeDefaultProps,
      treeRaidoChange,
      treeSelectChange,
      onSubmit,
      onReset,
      exportData,
      onPageSizeChange,
      onCurrentChange,
      getAnalysisTreeData,
      getEnergyCodeData,
      formatFact,
    };
  },
});
