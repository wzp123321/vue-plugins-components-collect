import { ITHCompareVO, checkHasTHCompare } from '../../utils/check';
import { defineComponent, PropType, computed, ref, toRef } from 'vue';
import { formatEmptyValue, thousandSeparation, onScroll, formatDate } from '@/utils/index';
export default defineComponent({
  name: 'EnergyConsumptionDetail',
  props: {
    listData: {
      type: Array as PropType<AnalysisManageModule.EnergyTableList[]>,
      default: [],
    },
    unit: {
      type: String,
      default: '',
    },
    valueMean: {
      type: String,
      default: null,
    },
    columnName: {
      type: String,
      default: '',
    },
    tableHeight: {
      type: Number,
      default: 528,
    },
    unitTime: {
      type: String,
      default: '',
    },
    timeSection: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props) {
    const isMH = ref<ITHCompareVO>({
      tbFlag: false,
      hbFlag: false,
    });
    isMH.value = checkHasTHCompare(props.unitTime, props.timeSection, false);

    const computedColumnName = computed(() => {
      return props.columnName;
    });
    const formatterUnit = (row: any, column: any, cellValue: any) => {
      return formatEmptyValue(cellValue, '%');
    };
    return {
      computedColumnName,
      isMH,
      thousandSeparation,
      formatterUnit,
      onScroll,
    };
  },
});
