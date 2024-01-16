import { defineComponent, PropType, computed } from 'vue';
import { onPageTo } from '../../../utils/index';
import { AbnormalType } from '../../../constant/index';

export default defineComponent({
  name: 'RankAnomaly',
  props: {
    abnormalRankDataList: {
      type: Array as PropType<EnergyAnomalyModule.AbnormalRankDataList[]>,
      default: [],
    },
    treeType: {
      type: Number,
      default: 1,
    },
    energyCode: {
      type: String,
      default: '',
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
  },
  setup(props, { emit }) {
    // 数据列表
    const abnormalRankDataList = computed(() => {
      return props.abnormalRankDataList;
    });
    // 数据
    const typeAnomalyDetail = computed(() => {
      return props.typeAnomalyDetail;
    });
    // alarmId
    const alarmId = computed(() => {
      return props.alarmId;
    });
    const toDetail = (type: number, row: GlobalModule.CommonObject) => {
      onPageTo(type, {
        ...row,
        ...{ treeType: props.treeType, energyCode: props.energyCode },
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
      abnormalRankDataList,
      typeAnomalyDetail,
      alarmId,
      AbnormalType,
      toDetail,
      onAlarmDeal,
    };
  },
});
