import { defineComponent, onMounted, PropType, reactive, ref, computed, nextTick, watch } from 'vue';
// utils
import { subDays, startOfDay } from 'date-fns';
import { formatDate } from '@/utils/index';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';
import { useCommonController } from '@/utils/use-common-controller';
import { cloneDeep } from 'lodash';
import {
  onContrastFormParamsCheck,
  mapMultiObjectFlag,
  mapMultiTimeFlag,
} from '@/views/pages/energy-contrast/utils/index';
// components
import MultipleDatePicker from '../ec-multiple-date-picker/ec-multiple-date-picker.vue';
import DateTimeUnitPicker from '../ec-date-timeunit-picker/ec-date-timeunit-picker.vue';
// config
import { treeTypeList, dateScopeListAll } from '@/config/config';
import { EContrastType, EMultipleTimeType, defaultProps, defaultPropsTreeSelect } from '../../energy-contrast.api';
import { Common_ETimeUnit, Common_ICodeName } from '@/services/common/common-api';

export interface TreeData {
  [key: string]: any;
}
interface SearchState {
  energyType: number[];
  queryType: number;
  energyCode: string[];
  dateScope: number;
  dateScopeAll: number;
  radioValue: number;
  queryTimeList: Date[];
  treeIds: number[];
  timeUnit: string;
}
export default defineComponent({
  name: 'contrastSearch',
  components: {
    MultipleDatePicker,
    DateTimeUnitPicker,
  },
  props: {
    serverDate: {
      // 数据源
      type: Date as PropType<Date>,
      default: [],
    },
    // 指标
    valueMeanList: {
      type: Array as PropType<Array<{ code: string; name: string }>>,
      default: [],
    },
    timeUnitList: {
      type: Array as PropType<Array<Common_ICodeName>>,
      default: [],
    },
  },
  emits: ['onSubmit', 'onReset', 'handleSearch', 'error'],
  setup(props, { emit }) {
    // 树类型
    const { getTreeListWithExpandKeys, getEnergyCodeTree } = useCommonController();
    const { serverDate } = props;
    // 本地缓存数据
    const sessionParams = ref<GlobalModule.CommonObject>();
    // 字典
    const valueMeanList = computed<Array<{ code: string; name: string }>>(() => {
      return props.valueMeanList;
    });

    // 对比类型
    const contrastTypeOptions = computed(() =>
      Object.entries(EContrastType)
        .filter(([k, v]) => typeof v === 'number')
        .map(([k, v]) => ({ label: k, value: v })),
    );
    // 对比类型
    const contrastTypeValue = ref(EContrastType.多对象);
    // 能源指标
    const energyValueMean = ref<string>(props.valueMeanList?.length ? props.valueMeanList[0].code : '');
    // 表单
    const formSearch = reactive<SearchState>({
      energyType: [1],
      energyCode: [],
      queryType: 1,
      dateScope: 0,
      radioValue: 1,
      dateScopeAll: 0,
      queryTimeList: [serverDate, serverDate],
      treeIds: [],
      timeUnit: Common_ETimeUnit.十分钟,
    });

    // 多时间日期选择
    const chooseTimeList = ref<string[]>([]);
    const analysisObjectData = ref<TreeData[]>([]);
    // 树节点展开数组
    const contrastExpandKeys = ref<number[]>([]);
    // 树loading
    const treeLoading = ref(false);
    // 分类分项
    const energyTreeData = ref<TreeData>([]);
    // 根据树类型计算出的分类分项
    const computedEnergyTreeData = computed(() => {
      return (
        energyTreeData.value &&
        energyTreeData.value.map((item: any) => {
          const newItem = cloneDeep(item);
          newItem.childEnergyCode = formSearch.radioValue === 1 ? newItem.childEnergyCode : [];
          return newItem;
        })
      );
    });

    const treeIdsArr = ref<number[]>([]);
    /**
     * 对比类型change
     * @param val
     */
    const handleContrastTypeChange = (val: number) => {
      if (val === EContrastType.多对象) {
        formSearch.queryTimeList = [startOfDay(new Date()), new Date()];
        formSearch.timeUnit = Common_ETimeUnit.十分钟;
        if (formSearch.energyCode?.length === 0) {
          formSearch.energyCode = computedEnergyTreeData.value?.length ? [computedEnergyTreeData.value[0].code] : [];
        }
      }
      if (val === EContrastType.多时间) {
        if (formSearch.energyCode?.length === 0) {
          formSearch.energyCode = computedEnergyTreeData.value?.length ? [computedEnergyTreeData.value[0].code] : [];
        }
        formSearch.dateScopeAll = dateScopeListAll[0].value;
        formSearch.timeUnit = Common_ETimeUnit.十分钟;
        // 今天 昨天
        const startDate = new Date();
        const endDate = new Date(subDays(new Date(), 1));
        chooseTimeList.value = [formatDate(startDate, 'yyyy-MM-dd HH:mm'), formatDate(endDate, 'yyyy-MM-dd HH:mm')];
      }
      getCheckedKeys();

      onSubmit();
    };
    // 能耗类型change
    const onEnergyCodeChange = async () => {
      if (formSearch.energyCode?.length === 0) {
        return;
      }
      formSearch.treeIds = [];
      await getTreeList();
    };
    /**
     * 分析对象 树类型切换
     */
    const handleTreeTypeChange = async () => {
      formSearch.treeIds = [];
      if (energyTreeData.value?.length !== 0) {
        formSearch.energyCode = energyTreeData.value?.length ? [energyTreeData.value[0].code] : [];
      }
      await getTreeList();

      getCheckedKeys();
    };
    /**
     * 查询树节点
     */
    const getTreeList = async () => {
      try {
        treeLoading.value = true;
        const res = await getTreeListWithExpandKeys(formSearch.radioValue, formSearch.energyCode[0]);
        if (res && res.data) {
          analysisObjectData.value = res.data;
          contrastExpandKeys.value = res.expandTreeIds;
        } else {
          analysisObjectData.value = [];
          contrastExpandKeys.value = [];
        }
        treeLoading.value = false;
      } catch (error) {
        formSearch.treeIds = [];
        analysisObjectData.value = [];
        contrastExpandKeys.value = [];
        treeLoading.value = false;
      }
    };

    /**
     * 表单提交
     */
    const onSubmit = () => {
      if (!onContrastFormParamsCheck(formSearch, contrastTypeValue.value, chooseTimeList.value)) {
        return;
      }
      const params = {
        energyCode: formSearch.energyCode[0],
        queryFlag: contrastTypeValue.value,
        treeIds: formSearch.treeIds,
        valueMean: energyValueMean.value,
        timeUnit: formSearch.timeUnit,
      };
      // 多对象
      if (contrastTypeValue.value === EContrastType.多对象) {
        const { endTime, startTime } = mapQueryTime();
        emit('onSubmit', {
          ...params,
          timeType: formSearch.dateScope,
          queryTime: { endTime, startTime },
        });
      } else {
        // 多时间
        emit('onSubmit', {
          ...params,
          timeType: formSearch.dateScopeAll,
          multiTimeList: chooseTimeList.value,
        });
      }
    };
    /**
     * 处理多对象查询时间
     * @returns
     */
    const mapQueryTime = () => {
      const startTime = formatDate(formSearch.queryTimeList[0], 'yyyy-MM-dd HH:mm');
      const endTime = formatDate(formSearch.queryTimeList[1], 'yyyy-MM-dd HH:mm');
      return {
        endTime,
        startTime,
      };
    };

    /**
     * 重置
     */
    const onReset = async () => {
      try {
        if (valueMeanList.value?.length === 0) {
          emit('error');
          return;
        }
        emit('handleSearch');
        formSearch.dateScopeAll = EMultipleTimeType.日;
        formSearch.dateScope = 0;
        energyValueMean.value = valueMeanList.value?.length ? valueMeanList.value[0].code : '';
        formSearch.timeUnit = props.timeUnitList?.[0]?.code ?? '10m';
        contrastTypeValue.value = EContrastType.多对象;

        const startTime = `${formatDate(startOfDay(new Date()), 'yyyy-MM-dd HH:mm')}`;
        const endTime = `${formatDate(new Date(), 'yyyy-MM-dd HH:mm')}`;
        // 初始化时间
        formSearch.queryTimeList = [startOfDay(new Date()), new Date()];

        energyTreeData.value = await getEnergyCodeTree();
        if (energyTreeData.value?.length === 0) {
          emit('error');
          return;
        }
        formSearch.energyCode = [energyTreeData.value[0].code];
        // 树类型
        formSearch.radioValue = treeTypeList[0].value;
        const treeRes = await getTreeListWithExpandKeys(formSearch.radioValue, formSearch.energyCode[0]);
        if (treeRes && treeRes.data) {
          analysisObjectData.value = treeRes.data;
          contrastExpandKeys.value = treeRes.expandTreeIds;
          getCheckedKeys();
        }

        if (analysisObjectData.value?.length === 0) {
          emit('error');
          return;
        }

        emit('onReset', {
          timeUnit: formSearch.timeUnit,
          energyCode: formSearch.energyCode[0],
          queryFlag: EContrastType.多对象,
          timeType: 0,
          queryTime: { endTime, startTime },
          treeIds: formSearch.treeIds,
          valueMean: props.valueMeanList?.[0]?.code,
        });
      } catch (error) {
        emit('error');
      }
    };
    // 获取选中的节点
    const getCheckedKeys = () => {
      // 如果是多对象
      if (contrastTypeValue.value === EContrastType.多对象) {
        if (analysisObjectData.value?.length !== 0) {
          // 只有一个二级
          if (analysisObjectData.value[0].childTree?.length === 1) {
            // 有三级
            if (analysisObjectData.value[0].childTree[0]?.childTree?.length > 0) {
              formSearch.treeIds = analysisObjectData.value[0].childTree[0].childTree.map(
                (item: TreeManageModule.TreeList) => {
                  return item.id;
                },
              );
              // 只有一个三级
              if (analysisObjectData.value[0].childTree[0].childTree?.length === 1) {
                formSearch.treeIds.push(analysisObjectData.value[0].childTree[0].id);
              }
            } else {
              // 没有三级 选中所有二级
              formSearch.treeIds = analysisObjectData.value[0].childTree.map((item: TreeManageModule.TreeList) => {
                return item.id;
              });
              // 如果二级只有一个
              if (formSearch.treeIds?.length === 1 && !analysisObjectData.value[0]?.lockFlag) {
                formSearch.treeIds.push(analysisObjectData.value[0].id);
              }
            }
          } else {
            formSearch.treeIds = analysisObjectData.value[0].childTree.map((item: TreeManageModule.TreeList) => {
              return item.id;
            });
            if (formSearch.treeIds?.length === 0 && !analysisObjectData.value[0]?.lockFlag) {
              formSearch.treeIds.push(analysisObjectData.value[0].id);
            }
          }
        } else {
          formSearch.treeIds = [];
        }
        formSearch.treeIds = formSearch.treeIds.slice(0, 10);
      } else {
        // 如果是多时间
        if (analysisObjectData.value?.[0]?.childTree?.[0]?.id) {
          formSearch.treeIds = [analysisObjectData.value?.[0]?.childTree?.[0]?.id];
        }
      }
    };
    /**
     * 接收父组件参数
     * @param value
     * @param treeArr
     * @param expandKeys
     */
    const getFatherInfo = (value: TreeData[], treeArr: number[], expandKeys: number[]) => {
      formSearch.treeIds = treeArr;
      treeIdsArr.value = treeArr;
      contrastExpandKeys.value = expandKeys;
      analysisObjectData.value = value;
      console.log(props.valueMeanList);
      energyValueMean.value = props.valueMeanList?.length ? props.valueMeanList[0].code : '';
    };
    /**
     * 接收能源类型数据
     * @param value
     */
    const getEnergyTypeData = (value: TreeData) => {
      energyTreeData.value = value;
      formSearch.energyCode = [value[0].code];
      if (sessionParams.value) {
        formSearch.energyCode = [sessionParams.value.energyCode];
      }
    };
    watch(
      () => props.valueMeanList,
      (newVal) => {
        energyValueMean.value = newVal?.length ? newVal[0].code : '1';
      },
    );
    watch(
      () => props.timeUnitList,
      (newVal) => {
        formSearch.timeUnit = newVal?.length ? newVal[0].code : '10m';
      },
    );
    /**
     * 初始化
     */
    onMounted(() => {
      // 初始化时间
      formSearch.queryTimeList = [startOfDay(serverDate), serverDate];
      /**
       * 获取缓存参数
       */
      if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
        sessionParams.value = JSON.parse(
          JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))),
        );
        if (sessionParams.value) {
          if (sessionParams.value?.treeType) {
            formSearch.radioValue = sessionParams.value?.treeType;
          }
          formSearch.dateScope = -1;
          nextTick(() => {
            let startDate = subDays(new Date(), 1);
            if (sessionParams.value?.transferDate) {
              startDate = subDays(new Date(sessionParams.value?.transferDate), 1);
            }
            formSearch.queryTimeList = [startOfDay(startDate), startDate];
            formSearch.timeUnit = Common_ETimeUnit.天;
            contrastTypeValue.value = EContrastType.多对象;
          });
        }
      }
      formSearch.energyType = [1];
    });
    return {
      EContrastType,
      computedEnergyTreeData,
      sessionParams,
      contrastTypeOptions,
      contrastTypeValue,
      energyValueMean,
      valueMeanList,
      formSearch,
      treeTypeList,
      contrastExpandKeys,
      analysisObjectData,
      energyTreeData,
      treeLoading,
      defaultProps,
      defaultPropsTreeSelect,
      chooseTimeList,
      treeIdsArr,
      disabledProps,

      handleContrastTypeChange,
      handleTreeTypeChange,
      onSubmit,
      onReset,
      getEnergyTypeData,
      getFatherInfo,
      onEnergyCodeChange,
      FGetElTreeDefaultProps,
      mapMultiObjectFlag,
      mapMultiTimeFlag,
    };
  },
});
