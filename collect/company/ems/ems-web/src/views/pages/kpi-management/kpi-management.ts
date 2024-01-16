import { defineComponent, reactive, ref, onMounted } from 'vue';
import commonService from '@/services/common/common.service';
import useCurrentInstance from '@/utils/use-current-instance';
import LineCharts from './components/km-line-charts/km-line-charts.vue';
import { formatDate, openBlankUrl } from '@/utils/index';
import { cloneDeep } from 'lodash';
import { quotaTypeList } from '@/config/config';
import { CHOOSETIME } from '@/config/enum';
import KPIManagement from './services/kpi-management';
// components
import UsingProgress from './components/km-using-progress/km-using-progress.vue';
import EcaTreeSelect from '@/views/pages/energy-conservation-assess/components/eca-tree-select/eca-tree-select.vue';

export interface TreeData {
  [key: string]: any;
}

export default defineComponent({
  name: 'kpiManagement',
  components: {
    UsingProgress,
    LineCharts,
    EcaTreeSelect,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    // 查询日期
    const searchDate = ref(new Date());
    const radioData = proxy.$emsConfig.treeTypeList;
    const treeLoading = ref<boolean>(false);
    let serverDate: Date;
    const formInline = reactive<TreeData>({
      chooseTime: 1,
      radioValue: 1,
      analysisObject: [],
      monthDate1: '',
    });
    const abnormal = ref<boolean>(true);
    const maxIndex = ref<number>();
    const keys = ref<number>(1);
    const nums = ref<number>(1);
    let chooseTimeData = reactive<any>([]); // 存放定额类型数据
    const analysisObjectData = ref<KPIQuota.CommonObject[]>([]); // 能源分析数据
    const analysisObjectExpanedKeys: any[] = [];
    const tableData = ref<any>([]); // 存放主体数据
    const loading = ref<boolean>(true);
    // 错误提示
    const errorMessage = ref('暂无数据');
    let echartsWrap;
    // 初始化日期
    const pageInit = async () => {
      try {
        serverDate = await commonService.getServerDate();
        abnormal.value = true;
        formInline.monthDate1 = serverDate;
      } catch (err) {
        loading.value = false;
        abnormal.value = false;
      }
    };
    /**
     * 修改定额类型
     */
    const onTypeChange = () => {
      formInline.monthDate1 = serverDate;
      getAnalysisData({
        quotaDate:
          formInline.chooseTime === 1
            ? formatDate(formInline.monthDate1, 'yyyy-MM')
            : formatDate(formInline.monthDate1, 'yyyy'),
        quotaType: formInline.chooseTime,
        treeType: formInline.radioValue,
      });
    };
    /**
     * 时间change
     */
    const onDateChange = () => {
      getAnalysisData({
        quotaDate:
          formInline.chooseTime === 1
            ? formatDate(formInline.monthDate1, 'yyyy-MM')
            : formatDate(formInline.monthDate1, 'yyyy'),
        quotaType: formInline.chooseTime,
        treeType: formInline.radioValue,
      });
    };

    // 选择树radio切换触发的事件
    const treeRaidoChange = () => {
      try {
        treeLoading.value = true;

        getAnalysisData({
          quotaDate:
            formInline.chooseTime === 1
              ? formatDate(formInline.monthDate1, 'yyyy-MM')
              : formatDate(formInline.monthDate1, 'yyyy'),
          quotaType: formInline.chooseTime,
          treeType: formInline.radioValue,
        });
      } catch (err) {
        abnormal.value = false;
        console.log(err);
      }
    };
    // 获取定额类型数据
    chooseTimeData = quotaTypeList;
    formInline.chooseTime = chooseTimeData[0].value;
    // 获取分析对象
    const getAnalysisData = async (param: any) => {
      try {
        const res = await KPIManagement.querytree(param);
        if (res.code === 200 && res.success) {
          if (res.data && res.data.kpiTreeList?.length) {
            analysisObjectData.value = res.data.kpiTreeList;
            formInline.analysisObject = [res.data.clickTree.id];
          } else {
            analysisObjectData.value = [];
            formInline.analysisObject = [];
          }
        } else {
          analysisObjectData.value = [];
          formInline.analysisObject = [];
          return proxy.$message.error(res.message);
        }
      } catch (err) {
        analysisObjectData.value = [];
        formInline.analysisObject = [];
        loading.value = false;
      } finally {
        treeLoading.value = false;
      }
    };
    // 获取页面主体数据
    const getData = async () => {
      try {
        loading.value = true;
        const obj = {
          treeId: formInline.analysisObject.length ? formInline.analysisObject[0] : '',
          quotaDate:
            formInline.chooseTime === 1
              ? formatDate(formInline.monthDate1, 'yyyy-MM')
              : formatDate(formInline.monthDate1, 'yyyy'),
          quotaType: formInline.chooseTime,
        };
        searchDate.value = formInline.monthDate1;
        const res = await KPIManagement.querydata(obj);

        if (res.code === 200 && res.success) {
          //  当没数据时候直接返回没有数据图片
          if (res?.data && res?.data?.energySubjectDetail?.length === 0) {
            abnormal.value = false;
            tableData.value = [];
            return;
          }
          tableData.value = res.data.energySubjectDetail.map((item: any) => {
            return {
              chartDisplay: item.chartDisplay ?? false,
              chartExceptionMessage: item.chartExceptionMessage ?? '',
              chartInfo: item?.chartInfo
                ? {
                    legendData: item?.chartInfo?.legendData ?? [],
                    quotaType: item?.chartInfo?.quotaType ?? '',
                    selectYear: item?.chartInfo?.selectYear ?? '',
                    seriesData: item?.chartInfo?.seriesData?.length
                      ? item?.chartInfo?.seriesData?.map((sItem: any) => {
                          return {
                            data: sItem.data ?? [],
                            dataThousand: sItem.dataThousand ?? [],
                            name: sItem.name ?? '',
                            smooth: sItem.smooth ?? true,
                            type: sItem.type ?? '',
                          };
                        })
                      : [],
                    unit: item?.chartInfo?.unit ?? '',
                    xaxisData: item?.chartInfo?.xaxisData?.length ? item?.chartInfo?.xaxisData : [],
                    yunit: item?.chartInfo?.yunit ?? '',
                  }
                : item?.chartInfo,
              itemId: item.itemId ?? 0,
              itemTitle: item.itemTitle ?? 0,
              progress: item?.progress
                ? {
                    benchTitle: item?.progress?.benchTitle ?? '',
                    benchUnit: item?.progress?.benchUnit ?? '',
                    benchValue: item?.progress?.benchValue ?? '',
                    consume: item?.progress?.consume
                      ? {
                          itemDay: item?.progress?.consume?.itemDay ?? '',
                          itemTitle: item?.progress?.consume?.itemTitle ?? '',
                          itemValue: item?.progress?.consume?.itemValue ?? 0,
                          itemValueThousand: item?.progress?.consume?.itemValueThousand ?? '',
                          percnet: item?.progress?.consume?.percnet ?? 0,
                          unit: item?.progress?.consume?.unit ?? '',
                        }
                      : item?.progress?.consume,
                    endTitle: item?.progress?.endTitle ?? '',
                    ideal: item?.progress?.ideal?.length
                      ? {
                          itemDay: item?.progress?.ideal?.itemDay ?? '',
                          itemTitle: item?.progress?.ideal?.itemTitle ?? '',
                          itemValue: item?.progress?.ideal?.itemValue ?? 0,
                          itemValueThousand: item?.progress?.ideal?.itemValueThousand ?? '',
                          percnet: item?.progress?.ideal?.percnet ?? 0,
                          unit: item?.progress?.ideal?.unit ?? '',
                        }
                      : item?.progress?.ideal,
                    isHistoryDate: item?.progress?.isHistoryDate ?? false,
                    quota: item?.progress?.quota?.length
                      ? {
                          itemDay: item?.progress?.quota?.itemDay ?? '',
                          itemTitle: item?.progress?.quota?.itemTitle ?? '',
                          itemValue: item?.progress?.quota?.itemValue ?? 0,
                          itemValueThousand: item?.progress?.quota?.itemValueThousand ?? '',
                          percnet: item?.progress?.quota?.percnet ?? 0,
                          unit: item?.progress?.quota?.unit ?? '',
                        }
                      : item?.progress?.quota,
                    startTitle: item?.progress?.startTitle ?? '',
                  }
                : item?.progress,
              proposeInfo: item?.proposeInfo ?? '',
            };
          });
          // console.log(tableData.value);
          maxIndex.value = tableData.value.length >= 1 ? tableData.value.length - 1 : 0;
          nums.value++;
          keys.value++;
          abnormal.value = true;
          loading.value = false;
        } else {
          abnormal.value = false;
          loading.value = false;
          return proxy.$message.error(res.message);
        }
        // console.log('主体数据', res);
      } catch (err) {
        loading.value = false;
        abnormal.value = false;
        console.log(err);
      }
    };
    const onDisableDateCb = (date: Date) => {
      return date.getTime() > new Date().getTime();
    };
    // 查询按钮事件
    const onSubmit = () => {
      errorMessage.value = '暂无数据';
      if (formInline.analysisObject.length <= 0) {
        abnormal.value = false;
        proxy.$message.error('分析对象不能为空！');
        return;
      }
      getData();
    };
    // 重置按钮事件
    const onReset = async () => {
      formInline.chooseTime = quotaTypeList?.length ? chooseTimeData[0].value : 1;
      formInline.radioValue = radioData?.length ? radioData[0].value : 1;
      await pageInit();
      await getAnalysisData({
        quotaDate: formatDate(formInline.monthDate1, 'yyyy-MM'),
        quotaType: formInline.chooseTime,
        treeType: 1,
      });
      if (formInline.analysisObject.length < 1) {
        abnormal.value = false;
        return;
      }
      await onSubmit();
    };
    // 去定额配置页面
    const goNextPage = () => {
      const path = '/web/kpiQuotaConfigurations';
      sessionStorage.setItem('ems-kpiTypeId', '');
      sessionStorage.setItem('ems-kpiDingeType', '');
      sessionStorage.setItem('ems-kpiName', '');
      openBlankUrl(path);
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      await pageInit();
      await getAnalysisData({
        quotaDate: formatDate(formInline.monthDate1, 'yyyy-MM'),
        quotaType: formInline.chooseTime,
        treeType: 1,
      });
      if (formInline.analysisObject.length < 1) {
        abnormal.value = false;
        loading.value = false;
        return;
      }
      await onSubmit();
    });

    return {
      searchDate,
      formInline,
      errorMessage,
      onSubmit,
      chooseTimeData,
      CHOOSETIME,
      analysisObjectData,
      radioData,
      analysisObjectExpanedKeys,
      treeRaidoChange,
      onReset,
      goNextPage,
      tableData,
      abnormal,
      onDisableDateCb,
      loading,
      maxIndex,
      keys,
      nums,
      echartsWrap,
      treeLoading,

      onTypeChange,
      onDateChange,
    };
  },
});
