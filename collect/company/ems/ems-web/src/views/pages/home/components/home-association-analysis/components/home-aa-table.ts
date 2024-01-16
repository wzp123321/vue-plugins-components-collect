import { defineComponent, computed, toRefs, onMounted } from 'vue';
import { useStore } from 'vuex';
export default defineComponent({
  name: 'AssociationAnalysisTable',
  props: {
    tableData: {
      type: Array,
      default: [],
    },
    emptyText: {
      type: String,
      default: '暂无数据',
    },
  },
  setup(props) {
    const store = useStore();
    const lightOrDark = computed(() => {
      return store.getters.theme === 'light' ? true : false;
    });
    const emptyText = computed(() => {
      return props.emptyText;
    });

    return {
      lightOrDark,
      emptyText,
    };
  },
});
