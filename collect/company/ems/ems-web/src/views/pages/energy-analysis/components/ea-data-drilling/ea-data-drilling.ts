import { checkHasTHCompare, ITHCompareVO } from '../../utils/check';
import { defineComponent, ref, PropType, computed, toRef } from 'vue';
import { formatDate, thousandSeparation } from '@/utils/index';
import { isThisYear } from 'date-fns';

export default defineComponent({
  name: 'DataDrilling',
  props: {
    dataList: {
      // 数据源
      type: Array as PropType<AnalysisManageModule.DataDrillList[]>,
      default: [],
    },
    isLeaf: {
      // 是否是叶子节点
      type: Boolean,
      default: false,
    },
    unit: {
      // 数据单位
      type: String,
      default: '',
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
  setup(props, { emit }) {
    const tableData = ref(props.dataList || []);
    const isLeafValue = ref(props.isLeaf);
    const unitValue = ref(props.unit);

    const isMH = ref<ITHCompareVO>({
      tbFlag: false,
      hbFlag: false,
    });
    isMH.value = checkHasTHCompare(props.unitTime, props.timeSection);

    //
    const lastYearTimeInfo = computed(() => {
      return props.dataList && props.dataList?.length ? props.dataList[0].lastYearTimeInfo : '';
    });
    const lastMonthTimeInfo = computed(() => {
      return props.dataList && props.dataList?.length ? props.dataList[0].lastMonthTimeInfo : '';
    });
    /**
     * 节点点击事件
     * @param row
     * @param column
     * @param cell
     * @param event
     */
    const onCellClick = (id: number, name: string, drillFlag: boolean) => {
      if (isLeafValue.value) {
        return;
      }
      if (!drillFlag) {
        return;
      }
      emit('object-name-click', {
        id,
        name,
      });
    };
    const formatValue = (row: any, column: any, cellValue: any, index: number) => {
      return thousandSeparation(cellValue);
    };
    return {
      tableData,
      isLeafValue,
      unitValue,
      lastYearTimeInfo,
      lastMonthTimeInfo,
      isMH,
      onCellClick,
      formatValue,
      thousandSeparation,
    };
  },
});
