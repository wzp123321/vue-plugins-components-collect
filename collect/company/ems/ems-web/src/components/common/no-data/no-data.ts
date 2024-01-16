import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'NoData',
  props: {
    width: {
      type: Number,
      default: 200,
    },
    height: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: '暂无数据',
    },
    imgUrl: {
      type: String,
      default: require('../../../assets/img/common/common-no-data.svg'),
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    marginTop: {
      type: Number,
      default: 16,
    },
    // 是否有插槽
    hasSlot: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const hasSlot = computed(() => {
      return props.hasSlot;
    });
    const title = computed(() => {
      return props.title;
    });
    const { imgUrl } = props;

    return { title, imgUrl, hasSlot };
  },
});
