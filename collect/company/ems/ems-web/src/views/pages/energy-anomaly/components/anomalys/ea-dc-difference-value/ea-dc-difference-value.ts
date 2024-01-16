import { computed, defineComponent } from 'vue';
export default defineComponent({
  name: 'DifferenceValue',
  props: {
    // 数组
    count: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: ''
    },
    fontSize: {
      type: Number,
      default: 14
    },
    bolded: {
      type: Boolean,
      default: false
    },
    // 异常等级
    level: {
      type: Number,
      default: 2
    }
  },
  setup(props) {
    const { count, text, fontSize, bolded, level } = props;
    // 判断传入的count是否是数字
    const isNumber = computed(() => {
      return !isNaN(props.count);
    });
    return { count, text, fontSize, bolded, isNumber, level };
  }
});
