import { defineComponent, computed, ref } from 'vue';
export default defineComponent({
  name: 'KeyAreaAnalysisCard',
  props: {
    dataInfo: {
      type: Object,
      default: {},
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const unit = ref('m<sup>3</sup>');
    const cardData = computed(() => {
      return props.dataInfo;
    });
    const tagTextArray = ['日', '周', '月', '年'];
    /**
     * 转换同比，环比值
     * @param compareValue 比较值
     */
    const adaptCompareValue = (compareValue: string | null) => {
      if (
        Object.prototype.toString.call(compareValue) === '[object Null]' ||
        Object.prototype.toString.call(compareValue) === '[object Undefined]' ||
        compareValue === '--'
      ) {
        return {
          value: '--',
          absValue: '--',
        };
      }

      return {
        value: Number(compareValue),
        absValue: Math.abs(Number(compareValue)),
      };
    };
    return {
      cardData,
      tagTextArray,
      adaptCompareValue,
      unit,
    };
  },
});
