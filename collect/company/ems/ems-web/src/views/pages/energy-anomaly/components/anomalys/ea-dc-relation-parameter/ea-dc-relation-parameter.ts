import { defineComponent, PropType } from 'vue';
import { thousandSeparation } from '@/utils/index';

export default defineComponent({
  name: 'RelationParameter',
  props: {
    // 数组
    dataList: {
      type: Array as PropType<
        EnergyAnomalyModule.AbnormalCorrelationDataList[]
      >,
      default: [],
    },
  },
  setup(props) {
    const { dataList } = props;
    return { dataList, thousandSeparation };
  },
});
