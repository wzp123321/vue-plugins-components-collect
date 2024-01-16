import { defineComponent, onMounted, ref, nextTick } from 'vue';
// utils
import { cloneDeep } from 'lodash';
import { subDays } from 'date-fns';
import url from '@/api/api-url';
import { formatEmptyValue, formatDate, dataURLtoFile, thousandSeparation } from '@/utils/index';
import { onContrastExportParamsCheck, getTreeAllChildIds } from '@/views/pages/energy-contrast/utils/index';
import { useCommonController } from '@/utils/use-common-controller';
import message from '@/utils/message';
// service
import commonService from '@/services/common/common.service';
import energyContrastService from '@/views/pages/energy-contrast/services/energy-contrast.service';
// components
import EnergyContrastLine from '@/views/pages/energy-contrast/components/ec-line-charts/ec-line-charts.vue';
import ContrastSearch from './components/ec-search/ec-search.vue';
// config
import { treeTypeList } from '@/config/config';
import { VALUE_MEAN_UNCONFIGURE } from '@/config/enum';
import { EContrastType, EMultipleTimeType } from './energy-contrast.api';
import { Common_ETimeUnit, Common_ICodeName } from '@/services/common/common-api';

export default defineComponent({
  components: {
    ContrastSearch,
    EnergyContrastLine,
  },
  setup() {
    const { getTreeListWithExpandKeys, getDictDataByCode, getEnergyCodeTree } = useCommonController();
    // 树类型
    const treeType = ref(treeTypeList[0].value);
    // 展示error charts
    const showErrorEcharts = ref(false);
    // 页面loading
    const pageLoading = ref(false);
    // 导出loading
    const exportLoading = ref(false);
    // 报告导出loading
    const wordExportLoading = ref(false);
    // 缓存数据
    const sessionParams = ref<GlobalModule.CommonObject>();
    // 表格第三栏名字
    const energyTargetName = ref('');
    // 服务器时间
    let serverDate = new Date();
    /**
     * 获取服务器时间
     */
    const getServerDate = async () => {
      try {
        serverDate = await commonService.getServerDate();
      } catch (error) {
        serverDate = new Date();
      }
    };
    // 未配置时提示语
    const unConfigureMessage = ref('暂无数据');
    // 能源指标列表
    const valueMeanList = ref<Array<{ code: string; name: string }>>([]);
    // 时间颗粒度
    const timeUnitList = ref<Common_ICodeName[]>([]);
    const analysisObjectData = ref<GlobalModule.CommonObject[]>([]);
    // 搜索组件ref
    const contrastSearchRef = ref();
    // 折线图ref
    const energyContrastLineRef = ref();
    const showTimeObject = ref(true);
    // 获取折线图数据参数
    const queryContrastEchartsParams = ref<EnergyContrastManageModule.EnergyContrastQueryParams>({
      energyCode: '',
      queryFlag: EContrastType.多对象,
      queryTime: {
        endTime: formatDate(serverDate).slice(0, 16),
        startTime: formatDate(serverDate).slice(0, 10) + ' 00:00',
      },
      timeType: 0,
      treeIds: [],
      valueMean: '',
      timeUnit: '',
    });
    // 折线图导出
    const reportExport = async () => {
      if (showErrorEcharts.value && unConfigureMessage.value !== '暂无数据') {
        message.error(unConfigureMessage.value);
        return;
      }
      if (
        pageLoading.value ||
        !onContrastExportParamsCheck(queryContrastEchartsParams.value) ||
        wordExportLoading.value
      ) {
        return;
      }
      wordExportLoading.value = true;
      try {
        const { energyCode, queryTime, queryFlag, treeIds, timeType, valueMean, multiTimeList, timeUnit } =
          queryContrastEchartsParams.value;
        const canvas = document.getElementsByTagName('canvas');
        const pieCanvas = canvas[0].toDataURL('image/png');
        const contrastPhoto = (await dataURLtoFile(pieCanvas, 'contrast')) as Blob;
        const formData = new FormData();
        formData.append('contrastPhoto', contrastPhoto);
        formData.append('energyCode', energyCode);
        formData.append('queryFlag', JSON.stringify(queryFlag));
        formData.append('timeType', JSON.stringify(timeType));
        formData.append('treeIds', treeIds.join(','));
        formData.append('valueMean', JSON.stringify(Number(valueMean)));
        formData.append('timeUnit', timeUnit ?? '');
        if (queryFlag === EContrastType.多对象) {
          const startTime = queryTime && queryTime.startTime ? queryTime.startTime : '';
          const endTime = queryTime && queryTime.endTime ? queryTime.endTime : '';
          formData.append('reportStartTime', startTime);
          formData.append('reportEndTime', endTime);
        } else {
          formData.append('multiTimeList', multiTimeList ? multiTimeList.join(',') : '');
        }
        await commonService.getFileStreamDownload<GlobalModule.CommonObject>(
          formData,
          '/energyContrast/exportReport',
          '导出',
          () => {
            wordExportLoading.value = false;
          },
          () => {
            wordExportLoading.value = false;
          },
        );
      } catch (error) {
        message.error('导出失败');
        wordExportLoading.value = false;
      }
    };
    // 表格数据
    const tableData = ref([]);
    // 表格单位
    const valueUnit = ref('kWh');
    /**
     * 获取折线图数据接口
     * @returns
     */
    const onQueryContrastEcharts = async () => {
      if (!queryContrastEchartsParams.value.energyCode) {
        message.error('请选择能源类型！');
        pageLoading.value = false;
        showErrorEcharts.value = true;
        return;
      }
      if (queryContrastEchartsParams.value.treeIds?.length === 0) {
        message.error('请选择分析对象！');
        pageLoading.value = false;
        showErrorEcharts.value = true;
        return;
      }
      if (
        queryContrastEchartsParams.value.queryFlag === EContrastType.多对象 &&
        queryContrastEchartsParams.value.treeIds?.length < 2
      ) {
        message.error('请至少选择2个分析对象！');
        pageLoading.value = false;
        showErrorEcharts.value = true;
        return;
      }
      pageLoading.value = true;
      unConfigureMessage.value = '暂无数据';
      showErrorEcharts.value = false;
      showTimeObject.value = queryContrastEchartsParams.value.queryFlag !== EContrastType.多时间;

      try {
        // 对时间进行排序,如果是任意时间段则用第一个时间进行比较
        if (queryContrastEchartsParams.value.queryFlag === EContrastType.多时间) {
          queryContrastEchartsParams.value.multiTimeList = queryContrastEchartsParams.value.multiTimeList?.sort(
            (a, b) => {
              return queryContrastEchartsParams.value.timeType === EMultipleTimeType.任意时间段
                ? new Date(a?.split('~')?.[0]).getTime() - new Date(b?.split('~')?.[0]).getTime()
                : new Date(a).getTime() - new Date(b).getTime();
            },
          );
          if (queryContrastEchartsParams.value.timeType !== EMultipleTimeType.任意时间段) {
            queryContrastEchartsParams.value.multiTimeList = queryContrastEchartsParams.value.multiTimeList?.map(
              (item) => {
                return formatDate(new Date(item), 'yyyy-MM-dd');
              },
            );
          }
        }

        const res = await energyContrastService.queryEnergyContrastChartData(queryContrastEchartsParams.value);
        window.sessionStorage.removeItem('ems-energyAbnormalParams');

        if (res && res.code === 200 && res.data) {
          if (res.data.energyTableList.length > 0) {
            valueUnit.value = res.data.energyTableList[0].unit;
          }

          tableData.value = res.data.energyTableList;
          energyTargetName.value = res.data.colName ? res.data.colName.replace('能耗能耗', '能耗') : '';
          showErrorEcharts.value = false;

          nextTick(() => {
            energyContrastLineRef.value.getEnergyContrastLineData(res.data, queryContrastEchartsParams.value);
          });
        } else {
          tableData.value = [];
          showErrorEcharts.value = true;
          if (res.code === VALUE_MEAN_UNCONFIGURE.PER_CAPITA || res.code === VALUE_MEAN_UNCONFIGURE.UNIT_AREA) {
            showErrorEcharts.value = true;
            unConfigureMessage.value = res.message;
          }
        }
      } catch (error) {
        tableData.value = [];
        showErrorEcharts.value = true;
      } finally {
        pageLoading.value = false;
      }
    };
    // 开始查询
    const handleSearch = () => {
      pageLoading.value = true;
      showErrorEcharts.value = false;
    };
    // 初始化失败
    const onError = () => {
      pageLoading.value = false;
      showErrorEcharts.value = true;
      window.sessionStorage.removeItem('ems-energyAbnormalParams');
    };
    // 查询
    const onSubmit = (val: EnergyContrastManageModule.EnergyContrastQueryParams) => {
      queryContrastEchartsParams.value = {
        ...queryContrastEchartsParams.value,
        ...val,
      };
      onQueryContrastEcharts();
    };
    // 重置
    const onReset = (val: EnergyContrastManageModule.EnergyContrastQueryParams) => {
      queryContrastEchartsParams.value = {
        ...queryContrastEchartsParams.value,
        ...val,
      };
      onQueryContrastEcharts();
    };

    // 获取能源类型数据
    const getAllEnergyCodeTreeAsync = async () => {
      try {
        const res = await getEnergyCodeTree();
        contrastSearchRef.value.getEnergyTypeData(res);
        if (res.length > 0) {
          queryContrastEchartsParams.value.energyCode = res[0].code;
        } else {
          queryContrastEchartsParams.value.energyCode = '';
        }
        if (sessionParams.value) {
          queryContrastEchartsParams.value.energyCode = sessionParams.value.energyCode;
        }
      } catch (error) {
        queryContrastEchartsParams.value.energyCode = '';
        showErrorEcharts.value = true;
      }
    };
    // 获取分析对象数据
    const getAnalysisObjectAsync = async () => {
      if (queryContrastEchartsParams.value.energyCode === '') {
        return;
      }
      try {
        const res = await getTreeListWithExpandKeys(treeType.value, queryContrastEchartsParams.value.energyCode, 2);
        if (res && res.data) {
          analysisObjectData.value = res.data;
          getCheckedKeys();
          let treeArr: number[] = queryContrastEchartsParams.value.treeIds;
          window.sessionStorage.setItem('treeIds', JSON.stringify(treeArr));
          if (sessionParams.value && sessionParams.value.treeId) {
            treeArr = [];
            if (sessionParams.value.treeId) {
              treeArr.push(sessionParams.value.treeId);
            }
            if (sessionParams.value.contrastId) {
              treeArr.push(sessionParams.value.contrastId);
            }
          }
          // 对不可选或不存在的节点进行过滤
          if (treeArr?.length) {
            const allIds = getTreeAllChildIds(analysisObjectData.value);
            const newIds = cloneDeep(treeArr);
            treeArr = treeArr?.filter((item) => {
              return allIds.includes(item);
            });

            if (treeArr?.length !== newIds?.length) {
              window.sessionStorage.removeItem('ems-energyAbnormalParams');
              message.error('部分节点的院区权限受限');
            }
          }

          queryContrastEchartsParams.value.treeIds = treeArr;

          contrastSearchRef.value.getFatherInfo(res.data, treeArr, res.expandTreeIds);
        } else {
          analysisObjectData.value = [];
          queryContrastEchartsParams.value.treeIds = [];
        }
      } catch (error) {
        analysisObjectData.value = [];
        queryContrastEchartsParams.value.treeIds = [];
        showErrorEcharts.value = true;
      }
    };
    // 获取选中树节点
    const getCheckedKeys = () => {
      if (analysisObjectData.value?.length !== 0) {
        // 只有一个二级
        if (analysisObjectData.value[0].childTree?.length === 1) {
          // 有三级
          if (analysisObjectData.value[0].childTree[0]?.childTree?.length > 0) {
            queryContrastEchartsParams.value.treeIds = analysisObjectData.value[0].childTree[0].childTree.map(
              (item: TreeManageModule.TreeList) => {
                return item.id;
              },
            );
            // 只有一个三级
            if (analysisObjectData.value[0].childTree[0].childTree?.length === 1) {
              queryContrastEchartsParams.value.treeIds.push(analysisObjectData.value[0].childTree[0].id);
            }
          } else {
            // 没有三级 选中所有二级
            queryContrastEchartsParams.value.treeIds = analysisObjectData.value[0].childTree.map(
              (item: TreeManageModule.TreeList) => {
                return item.id;
              },
            );
            // 如果二级只有一个
            if (queryContrastEchartsParams.value.treeIds?.length === 1 && !analysisObjectData.value[0]?.lockFlag) {
              queryContrastEchartsParams.value.treeIds.push(analysisObjectData.value[0].id);
            }
          }
        } else {
          queryContrastEchartsParams.value.treeIds = analysisObjectData.value[0].childTree.map(
            (item: TreeManageModule.TreeList) => {
              return item.id;
            },
          );
          if (queryContrastEchartsParams.value.treeIds?.length === 0 && !analysisObjectData.value[0]?.lockFlag) {
            queryContrastEchartsParams.value.treeIds.push(analysisObjectData.value[0].id);
          }
        }
      } else {
        queryContrastEchartsParams.value.treeIds = [];
      }
      queryContrastEchartsParams.value.treeIds = queryContrastEchartsParams.value.treeIds.slice(0, 10);
    };
    // 导出
    const contrastDataExport = async () => {
      if (exportLoading.value) {
        return;
      }
      let timeList = {};
      const { energyCode, queryTime, queryFlag, timeUnit, treeIds, timeType, valueMean, multiTimeList } =
        queryContrastEchartsParams.value;
      if (queryContrastEchartsParams.value.queryFlag === EContrastType.多对象) {
        timeList = { queryTime };
      } else {
        timeList = { multiTimeList };
      }
      exportLoading.value = true;
      await commonService.getFileStreamDownload<EnergyContrastManageModule.EnergyContrastQueryParams>(
        {
          energyCode,
          queryFlag,
          timeUnit,
          timeType,
          treeIds: Array.from(new Set(treeIds)),
          valueMean,
          ...timeList,
        },
        url.downLoad.energyContrastExportUrl,
        '导出',
        () => {
          exportLoading.value = false;
        },
        () => {
          exportLoading.value = false;
        },
      );
    };
    /**
     * 初始化字典数据
     */
    const initDictionary = async () => {
      try {
        const promiseArr = [getDictDataByCode('time_unit'), getDictDataByCode('value_mean')];
        const resArr = await Promise.all(promiseArr);
        if (resArr[0]) {
          timeUnitList.value = resArr[0] ?? [];
        }
        if (resArr[1]) {
          valueMeanList.value = resArr[1] ?? [];
        }
      } catch (error) {
        timeUnitList.value = [];
        valueMeanList.value = [];
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        pageLoading.value = true;
        await initDictionary();
        // 默认值
        queryContrastEchartsParams.value.timeUnit = timeUnitList.value?.length ? timeUnitList.value[0].code : '';
        queryContrastEchartsParams.value.valueMean = valueMeanList.value?.length ? valueMeanList.value[0].code : '';

        /**
         * 获取缓存参数
         */
        if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
          sessionParams.value = JSON.parse(
            JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))),
          );
          if (sessionParams.value) {
            if (sessionParams.value?.treeType) {
              treeType.value = Number(sessionParams.value?.treeType);
            }
            // 从告警管理跳转过来，带着时间
            if (sessionParams.value?.transferDate) {
              queryContrastEchartsParams.value.queryTime = {
                startTime: `${formatDate(
                  new Date(subDays(new Date(sessionParams.value?.transferDate), 1)),
                  'yyyy-MM-dd',
                )} 00:00`,
                endTime: `${formatDate(
                  new Date(subDays(new Date(sessionParams.value?.transferDate), 1)),
                  'yyyy-MM-dd',
                )} 23:59`,
              };
              queryContrastEchartsParams.value.timeUnit = Common_ETimeUnit.天;
            } else {
              // 默认选中昨天---10m颗粒度-能耗对比异常
              queryContrastEchartsParams.value.timeUnit = Common_ETimeUnit.天;
              queryContrastEchartsParams.value.queryTime = {
                startTime: `${formatDate(new Date(subDays(new Date(), 1)), 'yyyy-MM-dd')} 00:00`,
                endTime: `${formatDate(new Date(subDays(new Date(), 1)), 'yyyy-MM-dd')} 23:59`,
              };
            }
          }
        }
        await getServerDate();
        await getAllEnergyCodeTreeAsync();

        // 如果能源类型为空
        if (!queryContrastEchartsParams.value.energyCode) {
          showErrorEcharts.value = true;
          pageLoading.value = false;
          return;
        }
        await getAnalysisObjectAsync();
        if (valueMeanList.value?.length === 0) {
          showErrorEcharts.value = true;
          pageLoading.value = false;
          return;
        }
        // 如果树为空
        if (
          analysisObjectData.value?.length === 0 ||
          (queryContrastEchartsParams.value.queryFlag === EContrastType.多对象 &&
            queryContrastEchartsParams.value.treeIds?.length < 2)
        ) {
          showErrorEcharts.value = true;
          pageLoading.value = false;
          return;
        }
        await onQueryContrastEcharts();
      } catch (error) {
        pageLoading.value = false;
        showErrorEcharts.value = true;
      }
    });
    return {
      pageLoading,
      valueUnit,
      tableData,
      energyTargetName,
      serverDate,
      analysisObjectData,
      contrastSearchRef,
      energyContrastLineRef,
      showErrorEcharts,
      queryContrastEchartsParams,
      showTimeObject,
      unConfigureMessage,
      wordExportLoading,
      exportLoading,
      valueMeanList,
      timeUnitList,

      reportExport,
      onQueryContrastEcharts,
      onSubmit,
      onError,
      handleSearch,
      onReset,
      getAllEnergyCodeTreeAsync,
      getAnalysisObjectAsync,
      contrastDataExport,
      formatEmptyValue,
      thousandSeparation,
    };
  },
});
