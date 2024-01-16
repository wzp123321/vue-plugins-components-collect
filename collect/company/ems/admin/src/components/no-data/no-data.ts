import { defineComponent } from 'vue';

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
      default: '',
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  },
  setup(props) {
    const { title, imgUrl } = props;

    return { title, imgUrl };
  },
});