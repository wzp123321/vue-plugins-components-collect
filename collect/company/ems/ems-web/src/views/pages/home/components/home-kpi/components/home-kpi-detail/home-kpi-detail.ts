import { defineComponent, PropType, onMounted, computed } from 'vue';
import { thousandSeparation } from '@/utils/index';
export interface TipsItem {
  content: string;
  subTip: string;
}
export default defineComponent({
  name: 'KpiDetail',
  props: {
    cardData: {
      type: Array as PropType<KpiModule.CardItem[]>,
      default: [],
    },
    tipsData: {
      type: Object as PropType<TipsItem>,
      default: {},
    },
    kpiType: {
      type: Number || String,
      default: '1',
    },
  },
  setup(props) {
    const cards = computed(() => {
      return props.cardData;
    });
    const tips: any = computed(() => {
      return props.tipsData;
    });
    const kpiType = computed(() => {
      return props.kpiType;
    });
    onMounted(() => {
      if (tips.value.content.includes('重点关注')) {
        tips.value.content = tips.value.content.replace(
          /重点关注/gi,
          '<span style="color: red;">$&</span>',
        );
      }
      if (tips.value.content.includes('紧急关注')) {
        tips.value.content = tips.value.content.replace(
          /紧急关注/gi,
          '<span style="color: red;">$&</span>',
        );
      }
      if (tips.value.content.includes('关注')) {
        tips.value.content = tips.value.content.replace(
          /关注/gi,
          '<span style="color: red;">$&</span>',
        );
      }
    });
    return {
      cards,
      tips,
      thousandSeparation,
      kpiType,
    };
  },
});
