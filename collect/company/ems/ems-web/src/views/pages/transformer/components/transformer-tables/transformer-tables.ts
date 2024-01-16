import {
  defineComponent,
  ref,
  onMounted,
  toRefs,
  PropType,
  reactive,
  watch,
  onUnmounted,
} from 'vue';
import { thousandSeparation } from '@/utils/index';
import { useCommonController } from '@/utils/use-common-controller';
import DataNone from '../transformer-data-none/transformer-data-none.vue';
export default defineComponent({
  name: 'transformerTables',
  components: {
    DataNone,
  },
  props: {
    // 参数水平，负载总览，损耗率总览
    tableData: {
      type: Object as PropType<TransformerModule.AllTableData>,
      default: {},
    },
    // 参数排名数组
    paramRank: {
      type: Array as PropType<string[]>,
      default: [],
    },
    // 公共参数数组
    paramData: {
      type: Array as PropType<TransformerModule.ParamInfo[]>,
      default: [],
    },
  },
  setup(props) {
    const { emitter } = useCommonController();
    const isSingleParam = ref(true);
    const { paramRank, paramData, tableData } = toRefs(props);
    const resTipsLevel = ref('');
    /**
     * isDataNone用于控制每个模块的初始页展示
     * tips 每个模块的提示信息
     * 0--参数水平 1--负载总览 2--损耗率总览 3--参数排名
     */
    const isDataNone = reactive([false, false, false, false]);
    const tips = reactive(['', '', '', '']);
    const tableDataShow = reactive<any>({
      loadDetailsVO: {},
      lossRatioDetailsVO: {},
      paramLevelLists: [],
    });
    watch(tableData, newV => {
      if (
        newV &&
        newV.loadDetailsVO &&
        newV.lossRatioDetailsVO &&
        newV.paramLevelLists
      ) {
        if (newV.loadDetailsVO.code === 200) {
          isDataNone[1] = false;
          tableDataShow.loadDetailsVO = newV.loadDetailsVO.data;
        } else {
          isDataNone[1] = true;
          tips[1] = newV.loadDetailsVO.message;
        }
        if (newV.lossRatioDetailsVO.code === 200) {
          isDataNone[2] = false;
          tableDataShow.lossRatioDetailsVO = newV.lossRatioDetailsVO.data;
        } else {
          isDataNone[2] = true;
          tips[2] = newV.lossRatioDetailsVO.message;
        }
        if (newV.paramLevelLists.code === 200) {
          isDataNone[0] = false;
          tableDataShow.paramLevelLists = newV.paramLevelLists.data;
        } else {
          isDataNone[0] = true;
          tips[0] = newV.paramLevelLists.message;
        }
      } else {
        tableDataShow.loadDetailsVO = {};
        tableDataShow.lossRatioDetailsVO = {};
        tableDataShow.paramLevelLists = [];
      }
    });
    watch(paramData, newV => {
      if (newV && newV[0]?.paramName && newV[0]?.unit) {
        paramName.value = newV[0]?.paramName + newV[0]?.unit;
      }
    });
    // 参数排名
    const paramName = ref('');
    const rankList = ref<string[]>([]);
    watch(paramRank, newV => {
      if (newV) {
        isDataNone[3] = false;
        rankList.value = newV;
      }
    });
    // 判断非空且对数字进行千分位
    const isNotNull = (val: any, expand: string = '') => {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        if (isNaN(val)) {
          return val + expand;
        } else {
          return thousandSeparation(Number(val)) + expand;
        }
      }
    };
    // 判断非空
    const isOnlyNotNull = (val: any, expand: string = '') => {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        return val + expand;
      }
    };
    // 判断非空且去掉数字中的负号
    const isNoMinus = (val: any, expand: string = '') => {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        if (isNaN(val)) {
          return val + expand;
        } else {
          const res = String(val).replace('-', '');
          return thousandSeparation(Number(res)) + expand;
        }
      }
    };
    // 转化小数为百分比
    const numTrans = (val: any, expand: string = '') => {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        if (isNaN(val)) {
          return val;
        } else {
          return Number(val) * 100 + expand;
        }
      }
    };
    // 判断正数
    const isPositiveNum = (val: any) => {
      if (val === null || val === undefined || val === '') {
        return false;
      } else {
        if (!isNaN(val)) {
          return Number(val) > 0;
        } else {
          return false;
        }
      }
    };
    // 判断负数
    const isNegativeNum = (val: any) => {
      if (val === null || val === undefined || val === '') {
        return false;
      } else {
        if (!isNaN(val)) {
          return Number(val) < 0;
        } else {
          return false;
        }
      }
    };
    // 判断是否应该展示为红
    const isShowRed = (num: any, numMin: any, numMax: any) => {
      if (isNaN(num)) {
        return false;
      } else {
        if (!isNaN(numMin) && Number(num) < Number(numMin)) {
          return true;
        }
        if (!isNaN(numMax) && Number(num) > Number(numMax)) {
          return true;
        }
        return false;
      }
    };
    // 判断是否应该展示单位
    const isShowUnit = (val: any) => {
      if (val === null || val === undefined || val === '') {
        return '';
      } else {
        return `(${val})`;
      }
    };
    onMounted(() => {
      emitter.on('start-query', (data: TransformerModule.FormData) => {
        if (data?.energyEfficiencySelected.length > 1) {
          rankList.value = [];
          isSingleParam.value = false;
        } else {
          isSingleParam.value = true;
        }
      });
      emitter.on('no-common-param', (data: any) => {
        isDataNone[3] = true;
        tips[3] = data;
      });
      emitter.on('change-params', (val: number) => {
        paramData.value.forEach(item => {
          if (item.paramId === val) {
            paramName.value = item.paramName + item.unit;
          }
        });
      });
    });
    onUnmounted(() => {
      emitter.off('no-common-param');
      emitter.off('change-params');
    });
    return {
      ...toRefs(tableDataShow),
      isSingleParam,
      resTipsLevel,
      isNotNull,
      isOnlyNotNull,
      isNoMinus,
      numTrans,
      isPositiveNum,
      isNegativeNum,
      isShowRed,
      isShowUnit,
      isDataNone,
      tips,
      paramName,
      rankList,
    };
  },
});
