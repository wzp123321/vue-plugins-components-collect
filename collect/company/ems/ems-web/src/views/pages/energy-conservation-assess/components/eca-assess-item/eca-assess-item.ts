import { computed, defineComponent } from 'vue';
import { mapEcaAssessItemStatusObj } from '../../utils';
import { thousandSeparation } from '@/utils';
export default defineComponent({
  name: 'AssessDataItem',
  props: {
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 状态
    waringCode: {
      type: String,
      default: '',
    },
    // 状态名
    subjectState: {
      type: String,
      default: '',
    },
    // 数量
    count: {
      type: String,
      default: '0',
    },
    // 单位
    unit: {
      type: String,
      default: '元',
    },
  },
  setup(props) {
    const thousandCount = computed(() => {
      return props.count !== null ? thousandSeparation(+props.count) : '--';
    });
    const { title, waringCode, unit, subjectState } = props;
    return { title, waringCode, thousandCount, unit, subjectState, mapEcaAssessItemStatusObj };
  },
});
