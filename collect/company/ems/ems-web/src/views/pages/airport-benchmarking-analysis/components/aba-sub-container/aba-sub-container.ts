import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SubContainer',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const title = computed(() => {
      return props.title;
    });
    return {
      title,
    };
  },
});
