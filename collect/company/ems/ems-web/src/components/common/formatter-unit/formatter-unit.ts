import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'FormatterUnit',
  props: {
    /**
     * 字符串
     */
    formatHtml: {
      type: String,
      default: 'kwh',
    },
    /**
     * 字体大小
     */
    fontSize: {
      type: [Number, String],
      default: '14px',
    },
    /**
     * 字体颜色
     */
    fontColor: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { fontColor } = props;

    const html = computed(() => {
      return props.formatHtml;
    });
    const compFontSize = computed(() => {
      const { fontSize } = props;
      let size = fontSize;
      if (Object.prototype.toString.call(fontSize) === '[object Number]') {
        size = fontSize + 'px';
      }
      return size;
    });
    return {
      html,
      compFontSize,
      fontColor,
    };
  },
});
