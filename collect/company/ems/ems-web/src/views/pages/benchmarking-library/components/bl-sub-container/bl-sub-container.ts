import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SubContainer',
  props: {
    title: {
      type: String,
      default: '',
    },
    count: {
      type: Number,
      default: '',
    },
  },
  setup(props) {
    const title = computed(() => {
      return props.title;
    });
    const count = computed(() => {
      return props.count;
    });
    return {
      title,
      count,
    };
  },
});
