import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { INPUT_TYPES } from '@/config/enum';

export default defineComponent({
  name: 'ChooseList',
  props: {
    title: {
      type: String,
      default: '',
    },
    activeId: {
      type: Number,
      default: 0,
    },
    nodeKey: {
      type: String,
      default: 'id',
    },
    dataList: {
      type: Array as PropType<TreeBindingModule.ConcentratorInfo[]>,
      default: [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { title } = props;
    const value = ref('');
    /**
     * 选中事件
     */
    const onChoose = (item: GlobalModule.CommonObject) => {
      emit('update:activeId', item[props.nodeKey]);
      emit('choose');
    };
    const id = computed(() => {
      return props.activeId;
    });
    const loading = computed(() => {
      return props.loading;
    });
    const key = computed(() => {
      return props.nodeKey;
    });
    /**
     * 根据输入框内容计算得到列表
     */
    const filterList = computed(() => {
      return props.dataList?.filter((item) => {
        return item.name.indexOf(value.value) !== -1;
      });
    });

    onMounted(() => {
      value.value = '';
    });
    return {
      filterList,
      id,
      title,
      key,
      INPUT_TYPES,
      value,
      loading,
      onChoose,
    };
  },
});
