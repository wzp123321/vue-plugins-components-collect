import { defineComponent, reactive, onMounted, toRefs, computed, ref } from 'vue';
// utils
import { useCommonController } from '@/utils/use-common-controller';
import useCurrentInstance from '@/utils/use-current-instance';
import { formatDate } from '@/utils/index';
import { subDays } from 'date-fns';
import { cloneDeep } from 'lodash';
// config
import energyBalanceService from '../../services/energy-balance.service';
const allTreeTypeList = ref<EnergyBalanceModule.AllTreeTypeListItem[]>([]);

interface BalanceFormState {
  pageForm: EnergyBalanceModule.PageFormParams;
  energyCodeList: EnergyCodeManageModule.EnergyInfo[];
}

export default defineComponent({
  name: 'BalanceSearchForm',
  emits: ['query', 'reset', 'update:dailyRatioFlag', 'updateForm', 'error'],
  props: {
    dailyRatioFlag: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const { getEnergyCodeTree, getServerDate } = useCommonController();
    const { proxy } = useCurrentInstance();
    const balanceFormState = reactive<BalanceFormState>({
      pageForm: {
        date: [],
        endTime: '',
        energyCode: [],
        startTime: '',
        treeId: -1,
        treeType: allTreeTypeList.value[0]?.value,
      },
      energyCodeList: [],
    });
    // 初始化表单
    let initialParams = {};
    // 根据treeType计算分类分项列表
    const compEnergyCodeList = computed(() => {
      return balanceFormState.energyCodeList.map((item) => {
        const newItem = cloneDeep(item);
        if (balanceFormState.pageForm.treeType === 2) {
          newItem.childEnergyCode = [];
        }
        return newItem;
      });
    });
    /*
       日期跨度不同 颗粒度不同 end
      */
    const energyTreeExpanedKeys: number[] = [1, 2];
    // 禁用日期
    const disabledDate = (date: Date) => {
      return date.valueOf() > new Date().getTime();
    };
    // 日期change
    const onDateChange = async (date: any[]) => {
      emit(
        'update:dailyRatioFlag',
        date && date?.length === 2 && formatDate(date[0], 'yyyy-MM-dd') === formatDate(date[1], 'yyyy-MM-dd'),
      );
    };
    /**
     * 获取能源类型数据
     */
    const initEnergyCode = async () => {
      try {
        balanceFormState.energyCodeList = await getEnergyCodeTree();
        if (balanceFormState.energyCodeList && balanceFormState.energyCodeList.length) {
          balanceFormState.pageForm.energyCode = [String(balanceFormState.energyCodeList[0].code)];
        } else {
          balanceFormState.pageForm.energyCode = [];
          emit('error');
        }
      } catch (err) {
        console.warn(err);
        emit('error');
      }
    };
    /**
     * 初始化时间
     */
    const initDate = async () => {
      try {
        const serverDate = await getServerDate();
        balanceFormState.pageForm.startTime = serverDate;
        balanceFormState.pageForm.endTime = serverDate;
        balanceFormState.pageForm.date = [serverDate, serverDate];
      } catch (error) {
        emit('error');
      }
    };
    /**
     * 树类型切换
     */
    const onTreeTypeChange = () => {
      if (balanceFormState.energyCodeList && balanceFormState.energyCodeList.length) {
        // 如果是支路树  能耗类型直接赋值电
        if (balanceFormState.pageForm.treeType === 3) {
          balanceFormState.pageForm.energyCode = ['01000'];
        } else {
          balanceFormState.pageForm.energyCode = [String(balanceFormState.energyCodeList[0].code)];
        }
      }
    };
    /**
     * 提交
     */
    const onSubmit = () => {
      // 判空处理
      const { date, energyCode, treeType, treeId } = balanceFormState.pageForm;
      if ((Array.isArray(date) && date.length < 2) || date === null) {
        return proxy.$message.error('请选择日期');
      }
      if (energyCode.length < 1) {
        return proxy.$message.error('请选择能源类型');
      }
      const params = { date, energyCode, treeType };
      if (treeId && treeId > 0) {
        Object.assign(params, { treeId });
      }
      emit('query', params);
    };
    /**
     * 重置
     */
    const onReset = async () => {
      balanceFormState.pageForm = {
        ...balanceFormState.pageForm,
        ...initialParams,
      };
      const { date, energyCode, treeType, treeId } = balanceFormState.pageForm;

      const params = { date, energyCode, treeType };
      if (treeId && treeId > 0) {
        Object.assign(params, { treeId });
      }
      emit('reset', params);
    };
    const getAllTreeTypeList = async () => {
      const params = {
        id: 1,
        moduleKey: 'tree',
      };
      try {
        const res = await energyBalanceService.querySystemManagement(params);
        if (res && res.code === 200 && res.data) {
          allTreeTypeList.value = res.data?.map((item: any) => {
            item.label = item.configurationItemName;
            item.value = Number(item.configurationItemCode);
            return item;
          });
          balanceFormState.pageForm.treeType = allTreeTypeList.value[0]?.value;
        } else {
          allTreeTypeList.value = [];
        }
      } catch (error) {
        allTreeTypeList.value = [];
      }
    };
    /**
     * 初始化
     * 分类分项  时间颗粒度
     */
    onMounted(async () => {
      try {
        await getAllTreeTypeList();
        await initEnergyCode();
        await initDate();

        if (allTreeTypeList.value?.length === 0) {
          emit('error');
        }

        initialParams = cloneDeep(balanceFormState.pageForm);
        /**
         * 处理能源异常模块---缓存
         */
        if (window.sessionStorage.getItem('ems-energyAbnormalParams')) {
          const params = JSON.parse(
            JSON.parse(JSON.stringify(window.sessionStorage.getItem('ems-energyAbnormalParams'))),
          );
          if (params && Object.keys(params)) {
            if (params.transferDate) {
              balanceFormState.pageForm.date = [
                new Date(subDays(new Date(params.transferDate), 1)),
                new Date(subDays(new Date(params.transferDate), 1)),
              ];
            } else {
              balanceFormState.pageForm.date = [new Date(subDays(new Date(), 1)), new Date(subDays(new Date(), 1))];
            }
            balanceFormState.pageForm.treeId = params.treeId;
            balanceFormState.pageForm.treeType = Number(params.treeType);
            balanceFormState.pageForm.energyCode = [params.energyCode];
            window.sessionStorage.removeItem('ems-energyAbnormalParams');
          }
        }
        if (balanceFormState.energyCodeList?.length === 0) {
          emit('error');
          return;
        }

        if (allTreeTypeList.value?.length !== 0) {
          const types = allTreeTypeList.value?.map((item) => {
            return Number(item.value);
          });
          if (!types.includes(balanceFormState.pageForm.treeType)) {
            emit('error', '请查看系统管理配置信息。');
            return;
          }
        }
        onSubmit();
      } catch (error) {
        emit('error');
        console.warn('初始化---error--------------', error);
      }
    });
    return {
      ...toRefs(balanceFormState),
      allTreeTypeList,
      compEnergyCodeList,
      energyTreeExpanedKeys,
      onTreeTypeChange,
      disabledDate,
      onDateChange,
      onSubmit,
      onReset,
      getAllTreeTypeList,
    };
  },
});
