import { defineComponent, PropType, computed } from 'vue';
import { thousandSeparation } from '@/utils/index';
import { onPageTo } from '../../../utils/index';

import DifferenceValue from '../ea-dc-difference-value/ea-dc-difference-value.vue';

export default defineComponent({
  name: 'CorrelationAnomaly',
  components: {
    DifferenceValue,
  },
  props: {
    // 数组
    abnormalCorrelationDataList: {
      type: Array as PropType<
        EnergyAnomalyModule.AbnormalCorrelationDataList[]
      >,
      default: [],
    },
    // 数据源
    typeAnomalyDetail: {
      type: Object as PropType<GlobalModule.CommonObject>,
      default: {},
    },
    // 告警id
    alarmId: {
      type: Number,
      default: 0,
    },
    treeId: {
      type: Number,
      default: 0,
    },
    treeType: {
      type: Number,
      default: 0,
    },
    energyCode: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    // 数据
    const typeAnomalyDetail = computed(() => {
      return props.typeAnomalyDetail;
    });
    const abnormalCorrelationDataList = computed(() => {
      return props.abnormalCorrelationDataList;
    });
    // alarmId
    const alarmId = computed(() => {
      return props.alarmId;
    });
    // 点击处理异常
    const onAlarmDeal = (value: number) => {
      emit(
        'update:alarmId',
        alarmId.value !== 0 && alarmId.value === value ? 0 : value,
      );
    };
    // 跳转详情页
    const onToDetailPage = (
      value: EnergyAnomalyModule.AbnormalCorrelationDataList,
    ) => {
      const params = {
        treeId: props.treeId,
        treeType: props.treeType,
        energyCode: props.energyCode,
      };
      const { paramName } = value;
      // 参数列表
      const browserParamList = [
        {
          paramName,
          index: 0,
        },
      ];
      Object.assign(params, { browserParamList });
      onPageTo(props.typeAnomalyDetail.typeId, params);
    };
    return {
      abnormalCorrelationDataList,
      typeAnomalyDetail,
      alarmId,
      onAlarmDeal,
      thousandSeparation,
      onToDetailPage,
    };
  },
});
