import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';

// utils
import { getFormatDateByTimeUnit } from '@/utils/index';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { useCommonController } from '@/utils/use-common-controller';
import { checkSearchParam } from '../../utils/index';
import { getTreeAllChildIds } from '@/views/pages/energy-contrast/utils';
import message from '@/utils/message';
import { startOfMonth, subDays } from 'date-fns';
import { cloneDeep } from 'lodash';
// components
import dateTimeUnitPicker from '@/views/pages/energy-analysis/components/ea-date-timeunit-linkage-picker/ea-date-timeunit-linkage-picker.vue';
import { energyModel } from '../../enum';
import commonService from '@/services/common/common.service';
import { Common_ETimeUnit, Common_ICodeName } from '@/services/common/common-api';

// 定时刷新时长 10分钟
const REFRESH_TIME = 10 * 60 * 1000;

export default defineComponent({
  name: 'EaSearch',
  components: {
    dateTimeUnitPicker,
  },
  setup(props, { emit }) {
    const { queryEnergyFlagOneExcludeTotalTree, getDictDataByCode, emitter } = useCommonController();

    const serverDate = ref<any>();
    // 能源类型列表
    const energyCodeList = ref<EnergyCodeManageModule.EnergyInfo[]>([]);
    // 树节点列表
    const treeIdList = ref<GlobalModule.CommonObject[]>([]);
    const treeLoading = ref<boolean>(false);
    // 树展开节点数组
    const treeIdExpandedKeys = ref<any[]>([]);
    // 树类型数组
    const treeTypeList = ref<Common_ICodeName[]>([]);
    // 能源指标
    const valueMeanList = ref<Array<{ code: string; name: string }>>([]);
    // 时间颗粒度
    const timeUnitData = ref<Array<{ code: string; name: string }>>([]);
    // 定时器对象
    let timer: any;
    //   是否展示时间颗粒度选择框
    const showTimeUnit = ref(true);
    // 是否展示快捷选时
    const showDateScope = ref<boolean>(true);
    // 表单
    const formSearch = ref<GlobalModule.CommonObject>({
      energyCode: [],
      timeUnit: timeUnitData.value?.length && timeUnitData.value[0].code ? timeUnitData.value[0].code : '',
      date: [],
      switchSelect: 0,
      radioValue: '',
      treeId: [],
      valueMean: '',
    });
    // 每次查询的参数
    const searchedParams = ref<GlobalModule.CommonObject>({});
    // 根据树类型处理分类分项数组
    const computedEnergyCodeList = computed(() => {
      return formSearch.value.radioValue === 2 && energyCodeList.value?.length
        ? energyCodeList.value.map((item) => {
            const newItem = cloneDeep(item);
            newItem.childEnergyCode = [];
            return newItem;
          })
        : energyCodeList.value;
    });
    /**
     * 初始化
     */
    const pageInit = async () => {
      try {
        const res = await commonService.getServerDate();
        serverDate.value = res;
        const initData = cloneDeep(serverDate.value);
        initData.setHours(0);
        initData.setMinutes(0);
        if (formSearch.value.radioValue === energyModel.科室) {
          // 2023-12-21-----科室跳转过来的默认查询时间改为当月截至昨日
          // 兼容是1号
          const yesterday = subDays(serverDate.value, 1);
          formSearch.value.date = [startOfMonth(yesterday), yesterday];
        } else {
          formSearch.value.date = [initData, serverDate.value];
        }
      } catch (error) {
        serverDate.value = new Date();
        const initData = cloneDeep(serverDate.value);
        initData.setHours(0);
        initData.setMinutes(0);
        formSearch.value.date = [initData, serverDate.value];
        emit('error');
      }
    };
    /**
     * 科室--日期禁用
     * @param current
     * @returns
     */
    const disableDateCb = (current: Date) => {
      return current.getTime() > subDays(new Date(), 1).getTime();
    };
    /**
     * 获取分析对象数据
     */
    const getAnalysisTreeData = async () => {
      const { energyCode } = formSearch.value;
      if (energyCode?.length === 0) {
        return;
      }
      treeLoading.value = true;
      await commonService
        .getEmsTreeInfoWithExpandKeys({
          treeType: formSearch.value.radioValue,
          energyCode: energyCode?.[0],
          expandLevel: 2,
        })
        .then((res: any) => {
          if (res && res.code === 200) {
            if (res.data && res.data.data) {
              treeIdList.value = res.data?.data || [];
              treeIdExpandedKeys.value = res.data?.expandTreeIds;
              formSearch.value.treeId =
                res.data && res.data.data && res.data.data.length > 0
                  ? !res.data.data[0]?.lockFlag
                    ? [res.data.data[0].id]
                    : res.data?.data[0]?.childTree?.length
                    ? [res.data?.data[0]?.childTree[0].id]
                    : []
                  : [];
            } else {
              treeIdList.value = [];
              formSearch.value.treeId = [];
            }
          } else {
            treeIdList.value = [];
            formSearch.value.treeId = [];
          }
        })
        .catch((error) => {
          treeIdList.value = [];
          formSearch.value.treeId = [];
          console.log('%c✨✨查询树节点Error✨✨', 'font-size: 24px', error);
          emit('error');
        })
        .finally(() => {
          treeLoading.value = false;
        });
    };

    /**
     * 获取科室分析对象数据
     */
    const getOfficeAnalysisTreeData = async () => {
      const { energyCode } = formSearch.value;
      if (energyCode?.length === 0) {
        return;
      }
      treeLoading.value = true;
      try {
        const res = await commonService.getOfficeAnalysisTreeData({
          treeType: formSearch.value.radioValue,
          energyCode: energyCode?.[0],
          expandLevel: 2,
        });
        console.log(res);
        if (res && res.code === 200) {
          if (res.data && res.data.data) {
            treeIdList.value = res.data?.data || [];
            treeIdExpandedKeys.value = res.data?.expandTreeIds;

            // 处理默认选中第一个末级节点科室
            handleDepartmentTreeSelected();
          } else {
            treeIdList.value = [];
            formSearch.value.treeId = [];
          }
        } else {
          treeIdList.value = [];
          formSearch.value.treeId = [];
        }
      } catch (error) {
        treeIdList.value = [];
        formSearch.value.treeId = [];
        console.log('%c✨✨查询科室树Error✨✨', 'font-size: 24px', error);
        emit('error');
      } finally {
        treeLoading.value = false;
      }
    };
    /**
     * 处理默认选中第一个末级节点科室
     */
    const handleDepartmentTreeSelected = () => {
      if (treeIdList.value?.length) {
        const handleSelect = (list: any) => {
          if (!list?.[0]?.childTree || list?.[0]?.childTree?.length === 0) {
            formSearch.value.treeId = [list?.[0]?.id];
          } else {
            // 展开节点
            const id = list?.[0]?.id as any;
            if (!treeIdExpandedKeys.value.includes(id)) {
              treeIdExpandedKeys.value?.push(id);
            }
            handleSelect(list?.[0]?.childTree);
          }
        };

        handleSelect(treeIdList.value);
      }
    };

    /*
     *查询事件
     */
    const onSubmit = () => {
      if (!checkSearchParam(formSearch.value)) {
        return;
      }
      const { startDate, endDate } = getFormatDateByTimeUnit(formSearch.value.timeUnit, formSearch.value.date);
      const searchParam: AnalysisManageModule.AnalysisSearchData = {
        endTime: endDate,
        energyCode:
          formSearch.value.energyCode && formSearch.value.energyCode.length > 0 ? formSearch.value.energyCode[0] : [],
        isSelf: true,
        startTime: startDate,
        timeUnit: formSearch.value.timeUnit,
        treeId: formSearch.value.treeId && formSearch.value.treeId.length > 0 ? formSearch.value.treeId[0] : [],
        valueMean: formSearch.value.valueMean,
      };
      searchedParams.value = cloneDeep(formSearch.value);
      handleRefresh();
      emit('search-submit', searchParam, formSearch.value.radioValue);
      if (formSearch.value.radioValue === energyModel.科室) {
        emitter.emit('search-office-global', searchParam);
      }
    };
    /**
     * 重置事件
     */
    const onReset = async () => {
      showTimeUnit.value = true;
      showDateScope.value = true;

      formSearch.value.valueMean = valueMeanList.value?.length ? valueMeanList.value[0].code : '';
      formSearch.value.timeUnit = timeUnitData.value?.length ? timeUnitData.value[0].code : '';
      formSearch.value.radioValue = treeTypeList.value[0].code ?? '1';
      emit('resetTreeType', formSearch.value.radioValue);
      try {
        emit('handleSearch');

        await pageInit();
        energyCodeList.value = await queryEnergyFlagOneExcludeTotalTree();
        if (energyCodeList.value?.length === 0) {
          emit('error');
          return;
        }
        formSearch.value.energyCode = [energyCodeList.value[0].code];
        await getAnalysisTreeData();
        if (treeIdList.value?.length === 0) {
          emit('error');
          return;
        }
        searchedParams.value = cloneDeep(formSearch.value);
        onSubmit();
      } catch (error) {
        emit('error');
      }
    };
    /**
     * 区域、业态切换事件
     */
    const treeRadioChange = async () => {
      if (formSearch.value.energyCode?.length === 0 || formSearch.value.energyCode[0] !== energyCodeList.value[0]) {
        formSearch.value.energyCode = energyCodeList.value?.length ? [energyCodeList.value[0].code] : [];
      }
      if (formSearch.value.radioValue === energyModel.科室) {
        showTimeUnit.value = false;
        // showDateScope.value = false;
        showDateScope.value = true;
        formSearch.value.timeUnit = Common_ETimeUnit.天;
        // 2023-12-21-----科室跳转过来的默认查询时间改为当月截至昨日
        // 兼容是1号
        const yesterday = subDays(serverDate.value, 1);
        formSearch.value.date = [startOfMonth(yesterday), yesterday];
        await queryDepartmentEnergyList();
        await getOfficeAnalysisTreeData();
      } else {
        showTimeUnit.value = true;
        showDateScope.value = true;
        formSearch.value.timeUnit = timeUnitData.value?.length ? timeUnitData.value[0].code : '';
        energyCodeList.value = await queryEnergyFlagOneExcludeTotalTree();
        if (energyCodeList.value && energyCodeList.value?.length) {
          formSearch.value.energyCode = [energyCodeList.value[0].code];
        }
        await getAnalysisTreeData();
      }
    };
    /**
     * 查询科室树--能源类型列表
     */
    const queryDepartmentEnergyList = async () => {
      energyCodeList.value = [];
      formSearch.value.energyCode = [];

      try {
        const res: any = await commonService.getEnergyTypeWithoutTotalEnergy();
        if (res?.success) {
          energyCodeList.value = res?.data ?? [];
          formSearch.value.energyCode = energyCodeList.value?.length ? [energyCodeList.value[0].code] : [];
        }
      } catch (error) {
        console.log('%c✨✨查询科室能源类型Error✨✨', 'font-size: 24px', error);
      }
    };
    /**
     * 能源类型切换
     */
    const energyChange = async () => {
      if (formSearch.value.radioValue === energyModel.科室) {
        await getOfficeAnalysisTreeData();
      } else {
        await getAnalysisTreeData();
      }
    };
    /**
     * 定时刷新
     */
    const handleRefresh = () => {
      clearInterval(timer);
      timer = setInterval(async () => {
        await pageInit();
        const { energyCode, radioValue, treeId, valueMean, timeUnit } = searchedParams.value;
        formSearch.value.timeUnit = timeUnit;
        formSearch.value.energyCode = energyCode;
        formSearch.value.valueMean = valueMean;
        formSearch.value.radioValue = radioValue;
        if (formSearch.value.radioValue === energyModel.科室) {
          await getOfficeAnalysisTreeData();
        } else {
          await getAnalysisTreeData();
        }
        formSearch.value.treeId = treeId;
        onSubmit();
      }, REFRESH_TIME);
    };
    /**
     * 初始化字典数据
     */
    const initDictionary = async () => {
      try {
        const promiseArr = [
          getDictDataByCode('value_mean'),
          getDictDataByCode('time_unit'),
          commonService.queryTreeTypeListByAdminTreeConfigure(),
          pageInit(),
        ];
        const resArr = await Promise.all(promiseArr);
        valueMeanList.value = resArr?.[0] ?? [];
        timeUnitData.value = resArr?.[1] ?? [];
        treeTypeList.value =
          resArr?.[2]?.data?.map((item: Common_ICodeName<number>) => {
            return {
              code: Number(item.code),
              name: item.name,
            };
          }) ?? [];
      } catch (error) {
        valueMeanList.value = [];
        timeUnitData.value = [];
        treeTypeList.value = [];
      }
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        emit('handleSearch');
        await initDictionary();

        formSearch.value.valueMean = valueMeanList.value?.length ? valueMeanList.value[0].code : '';
        formSearch.value.timeUnit = timeUnitData.value?.length ? timeUnitData.value[0].code : '';
        formSearch.value.radioValue = treeTypeList.value?.length ? treeTypeList.value[0].code : '';

        const params = JSON.parse(window.sessionStorage.getItem('ems-analysis-query-params') || '{}');
        if (params?.treeType !== '' && params?.treeType !== null && params?.treeType !== undefined) {
          formSearch.value.radioValue = params.treeType !== '' ? Number(params.treeType) : 1;
        }
        // 处理能源类型
        if (formSearch.value.radioValue === energyModel.科室) {
          await queryDepartmentEnergyList();
        } else {
          energyCodeList.value = await queryEnergyFlagOneExcludeTotalTree();
          if (energyCodeList.value && energyCodeList.value?.length) {
            formSearch.value.energyCode = [energyCodeList.value?.[0]?.code];
          }
        }

        if (params.date && params.date.length === 2) {
          const start = new Date(params.date[0]);
          start.setHours(0);
          start.setMinutes(0);
          const end = new Date(params.date[1]);

          formSearch.value.date = [start, end];
        }

        if (params?.energyCode?.length) {
          formSearch.value.energyCode = params?.energyCode ?? [];
        }
        if (params?.timeUnit) {
          formSearch.value.timeUnit = params?.timeUnit;
        }
        // 区分树类型
        if (formSearch.value.radioValue === energyModel.科室) {
          showTimeUnit.value = false;
          showDateScope.value = false;
          formSearch.value.timeUnit = '1d';
          // 2023-12-21-----科室跳转过来的默认查询时间改为当月截至昨日
          // 兼容是1号
          const yesterday = subDays(serverDate.value, 1);
          formSearch.value.date = [startOfMonth(yesterday), yesterday];
          await getOfficeAnalysisTreeData();
        } else {
          showTimeUnit.value = true;
          showDateScope.value = true;
          await getAnalysisTreeData();
        }

        if (params?.treeId) {
          formSearch.value.treeId = params?.treeId ? [params.treeId] : [];
        }
        if (
          valueMeanList.value?.length === 0 ||
          timeUnitData.value?.length === 0 ||
          !formSearch.value?.timeUnit ||
          energyCodeList.value?.length === 0 ||
          !formSearch.value?.energyCode ||
          treeIdList.value?.length === 0 ||
          formSearch.value?.treeId?.length === 0
        ) {
          emit('error');
          return;
        }

        window.sessionStorage.removeItem('ems-analysis-query-params');
        /**
         * 2023-11-27加
         * 判断跳转过来的节点是否有权限
         */
        if (params && params.treeId) {
          const allIds = getTreeAllChildIds(treeIdList.value);
          if (Array.isArray(allIds) && allIds.length && !allIds.includes(params.treeId)) {
            message.error('部分节点的院区权限受限或没有数据');
            formSearch.value.treeId = [];
            emit('error');
            return;
          }
        }

        onSubmit();
      } catch (error) {
        clearInterval(timer);
        console.log('%c✨✨初始化Error✨✨', 'font-size: 24px', error);
        emit('error');
      }
    });
    /**
     * 组件销毁
     */
    onUnmounted(() => {
      clearInterval(timer);
    });
    return {
      computedEnergyCodeList,
      formSearch,
      valueMeanList,
      energyCodeList,
      timeUnitData,
      treeIdList,
      treeLoading,
      treeIdExpandedKeys,
      treeTypeList,
      serverDate,
      timer,
      disabledProps,
      energyModel,
      showTimeUnit,
      showDateScope,
      disableDateCb,

      onSubmit,
      onReset,
      treeRadioChange,
      getAnalysisTreeData,
      FGetElTreeDefaultProps,
      energyChange,
    };
  },
});
