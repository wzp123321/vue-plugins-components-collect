import { cloneDeep } from 'lodash';
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
// utils
import useCurrentInstance from '@/utils/use-current-instance';
import { FBatchRemoveStorageData, FGetElTreeDefaultProps, FGetStorageData, disabledProps } from '@/utils/token';
import {
  differenceInCalendarDays,
  startOfWeek,
  startOfMonth,
  subDays,
  startOfYear,
  subYears,
  endOfYear,
} from 'date-fns';
import { useCommonController } from '@/utils/use-common-controller';
import { formatDate } from '@/utils/index';
// config
import { treeTypeList, dateScopeList } from '@/config/config';
import { COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY } from '@/config/session-key';

export default defineComponent({
  name: 'PageSearch',
  props: {
    // loading
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['search', 'update:loading', 'reset', 'error', 'initialSearch'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    const { getServerDate, getEnergyCodeTree, getTreeListWithExpandKeys } = useCommonController();
    // 树类型
    const treeType = ref(treeTypeList[0].value);
    // tree loading
    const treeLoading = ref(false);
    // 分类分项列表
    const computedEnergyCodeList = computed(() => {
      return treeType.value === 2 && energyCodeList.value?.length
        ? energyCodeList.value.map((item) => {
            const newItem = cloneDeep(item);
            newItem.childEnergyCode = [];
            return newItem;
          })
        : energyCodeList.value;
    });
    // 树列表
    const treeList = ref<TreeManageModule.TreeList[]>([]);
    // 分类分项列表
    const energyCodeList = ref<EnergyCodeManageModule.EnergyInfo[]>([]);
    // 快捷选时
    const dateScope = ref(dateScopeList[0].value);
    // 服务器时间
    let serverDate = new Date();
    // 表单
    const relationQyeryForm = reactive<RelationAnalysisModule.RelationAnalysisQueryForm>({
      energyCode: [],
      treeId: [],
      date: [],
    });
    const energyTreeExpanedKeys: number[] = [1, 2];
    // 树展开节点数组
    const treeExpanedKeys = ref<string[] | number[]>([]);
    /**
     * 时间选择器禁用
     */
    const disabledDate = (d: Date) => {
      return differenceInCalendarDays(d, new Date()) > 0;
    };
    // 日期切换
    const onDateChange = () => {
      dateToShortTime(relationQyeryForm.date as Date[]);
    };
    /**
     * 快捷选时切换事件
     */
    const onDateScopeChange = () => {
      switch (dateScope.value) {
        case 0:
          relationQyeryForm.date = [serverDate, serverDate];
          break;
        case 1:
          const startWeek = startOfWeek(serverDate, { weekStartsOn: 1 });
          relationQyeryForm.date = [startWeek, serverDate];
          break;
        case 2:
          const startMonth = startOfMonth(serverDate);
          relationQyeryForm.date = [startMonth, serverDate];
          break;
      }
    };
    /**
     * 时间选择反选快捷选时
     */
    const dateToShortTime = (date: string[] | Date[]) => {
      if (date?.length === 0 || Object.prototype.toString.call(date) === '[object Null]') {
        dateScope.value = -1;
      }
      const serDate = formatDate(serverDate, 'yyyy-MM-dd');
      const startWeek = formatDate(startOfWeek(serverDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const startMonth = formatDate(startOfMonth(serverDate), 'yyyy-MM-dd');
      const start = formatDate(date[0], 'yyyy-MM-dd');
      const end = formatDate(date[1], 'yyyy-MM-dd');
      if (start === serDate && end === serDate) {
        if (start === startWeek && dateScope.value === 1) {
          dateScope.value = 1;
        } else if (start === startMonth && dateScope.value === 2) {
          dateScope.value = 2;
        } else {
          dateScope.value = 0;
        }
      } else if (start === startWeek && end === serDate) {
        dateScope.value = 1;
      } else if (start === startMonth && end === serDate) {
        dateScope.value = 2;
      } else {
        dateScope.value = -1;
      }
    };
    // 分类分项切换
    const onEnergyCodeChange = async () => {
      if (relationQyeryForm.energyCode?.length === 0) {
        return;
      }
      await onQueryTreeList();
    };
    // 区态、业态 按钮切换事件
    const onTreeTypeChange = async () => {
      if (energyCodeList.value?.length === 0) {
        return;
      }
      try {
        treeLoading.value = true;
        // 重置分类分项 选中第一个
        if (energyCodeList.value?.length !== 0) {
          relationQyeryForm.energyCode = energyCodeList.value?.length ? [energyCodeList.value[0].code] : [];
        }
        await onQueryTreeList();
        treeLoading.value = false;
      } catch (error) {
        treeLoading.value = false;
      }
    };
    // 查询树节点
    const onQueryTreeList = async () => {
      try {
        const treeRes = await getTreeListWithExpandKeys(treeType.value, relationQyeryForm.energyCode[0]);
        if (treeRes && treeRes.data) {
          treeList.value = treeRes.data;
          treeExpanedKeys.value = treeRes.expandTreeIds;
          relationQyeryForm.treeId =
            treeRes.data?.length > 0
              ? !treeRes?.data[0]?.lockFlag
                ? [treeRes.data[0].id]
                : treeRes?.data[0]?.childTree?.length
                ? [treeRes?.data[0]?.childTree[0].id]
                : []
              : [];
        } else {
          treeList.value = [];
          treeExpanedKeys.value = [];
          relationQyeryForm.treeId = [];
        }
      } catch (error) {
        treeList.value = [];
        treeExpanedKeys.value = [];
        relationQyeryForm.treeId = [];
      }
    };
    /**
     * 提交查询
     */
    const onSubmit = async () => {
      if (relationQyeryForm.energyCode.length <= 0) {
        proxy.$message.error('能源类型不能为空！');
        emit('error', relationQyeryForm);
        return;
      }
      if (relationQyeryForm.treeId.length <= 0) {
        proxy.$message.error('分析对象不能为空！');
        emit('error', relationQyeryForm);
        return;
      }
      if (!relationQyeryForm.date) {
        proxy.$message.error('日期不能为空！');
        emit('error', relationQyeryForm);
        return;
      }
      emit('search', relationQyeryForm);
    };
    // 初始化
    const onInit = async () => {
      emit('update:loading', true);
      let params;
      if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
        params = JSON.parse(
          JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams') || '{}')),
        );
      }
      const date = await getServerDate();
      treeType.value = treeTypeList[0].value;
      if (params && params.treeType) {
        treeType.value = Number(params.treeType);
      }
      serverDate = date;
      // 默认查询过去一年的数据
      relationQyeryForm.date = [subYears(date, 1), date];
      if (params && Object.keys(params)?.length > 0) {
        let yesterday = subDays(new Date(), 1);
        if (params.transferDate) {
          yesterday = subDays(new Date(params.transferDate), 1);
        }
        relationQyeryForm.date = [yesterday, yesterday];
      }
      energyCodeList.value = await getEnergyCodeTree();
      if (energyCodeList.value?.length === 0) {
        emit('error', relationQyeryForm);
        return;
      }
      relationQyeryForm.energyCode = [energyCodeList.value[0].code];
      if (params && params.energyCode) {
        const { energyCode } = params;
        relationQyeryForm.energyCode = [energyCode];
      }
      // 查询树
      await onQueryTreeList();
      if (params && params.treeId) {
        const { treeId } = params;
        relationQyeryForm.treeId = [treeId];
      }
      window.sessionStorage.removeItem('ems-energyAbnormalParams');
    };
    /**
     * 重置
     */
    const onReset = async () => {
      await onInit();
      dateToShortTime(relationQyeryForm.date as Date[]);

      if (treeList.value?.length === 0) {
        emit('error', relationQyeryForm);
        return;
      }
      emit('reset', relationQyeryForm);
    };
    /**
     * 初始化
     */
    onMounted(async () => {
      try {
        await onInit();
        dateToShortTime(relationQyeryForm.date as Date[]);

        // 如果有首页跳转参数
        if (FGetStorageData(COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY)) {
          const date = JSON.parse(FGetStorageData(COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY) ?? '[]');
          if (date?.length === 2) {
            relationQyeryForm.date = date?.map((item: string) => new Date(item));
          }
          FBatchRemoveStorageData([COMMON_HOME_RELATION_ANALYSIS_SESSION_KEY]);
        }

        if (treeList.value?.length === 0 || relationQyeryForm.treeId?.length === 0) {
          emit('error', relationQyeryForm);
          return;
        }
        emit('initialSearch', relationQyeryForm);
      } catch (error) {
        emit('error', relationQyeryForm);
      }
    });

    return {
      relationQyeryForm,
      treeType,
      treeLoading,
      treeTypeList,
      dateScopeList,
      dateScope,
      treeList,
      energyTreeExpanedKeys,
      computedEnergyCodeList,
      treeExpanedKeys,
      disabledProps,

      FGetElTreeDefaultProps,
      onTreeTypeChange,
      onDateChange,
      onDateScopeChange,
      onSubmit,
      onReset,
      onEnergyCodeChange,
      disabledDate,
    };
  },
});
