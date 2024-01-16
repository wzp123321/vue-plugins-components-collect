import { defineComponent, PropType, computed } from 'vue';
import { thousandSeparation } from '@/utils/index';
import { AbnormalType } from '../../../constant/index';
import { onPageTo } from '../../../utils/index';
import DifferenceValue from '../ea-dc-difference-value/ea-dc-difference-value.vue';

export default defineComponent({
  name: 'ContrastAnomaly',
  components: {
    DifferenceValue,
  },
  props: {
    // 数组
    abnormalContrastDataList: {
      type: Array as PropType<EnergyAnomalyModule.AbnormalContrastDataList[]>,
      default: [],
    },
    // 数据源
    typeAnomalyDetail: {
      type: Object as PropType<GlobalModule.CommonObject>,
      default: {},
    },
    treeType: {
      type: Number,
      default: 1,
    },
    energyCode: {
      type: String,
      default: '',
    },
    treeId: {
      type: Number,
      default: 0,
    },
    // 告警id
    alarmId: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const abnormalContrastDataList = computed(() => {
      return props.abnormalContrastDataList;
    });
    // 数据
    const typeAnomalyDetail = computed(() => {
      return props.typeAnomalyDetail;
    });
    // alarmId
    const alarmId = computed(() => {
      return props.alarmId;
    });
    // 跳转详情
    const toDetail = (contrastId: number) => {
      onPageTo(AbnormalType.CONTRAST, {
        contrastId,
        energyCode: props.energyCode,
        treeId: props.treeId,
        treeType: props.treeType,
      });
    };
    // 点击处理异常
    const onAlarmDeal = (value: number) => {
      emit(
        'update:alarmId',
        alarmId.value !== 0 && alarmId.value === value ? 0 : value,
      );
    };
    return {
      abnormalContrastDataList,
      alarmId,
      typeAnomalyDetail,
      toDetail,
      thousandSeparation,
      onAlarmDeal,
    };
  },
});
