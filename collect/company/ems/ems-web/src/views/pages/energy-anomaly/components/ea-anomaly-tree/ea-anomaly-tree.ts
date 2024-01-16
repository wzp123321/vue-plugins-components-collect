import { defineComponent, computed, watch, ref, onMounted, PropType } from 'vue';
import { ElTree } from 'element-plus';
import { getTreeExpandKeys } from '@/utils/index';
import { FGetElTreeDefaultProps, disabledProps } from '@/utils/token';

export default defineComponent({
  name: 'EnergyAnomalyTree',
  props: {
    // 数据源
    treeDataSource: {
      type: Array as PropType<EnergyAnomalyModule.AnomalyTree[]>,
      default: [],
    },
    // 加载
    loading: {
      type: Boolean,
      default: false,
    },
    // 节点键值
    nodeKey: {
      type: String,
      default: '',
    },
    // 选中节点
    selectedKey: {
      type: Number,
      default: 0,
    },
    // 过滤文本
    filterText: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const { nodeKey } = props;
    const treeRef = ref(ElTree);
    // loading
    const loading = computed(() => {
      return props.loading;
    });
    // 数据源
    const dataSource = computed(() => {
      return props.treeDataSource;
    });
    // 过滤文本
    const filterStr = computed(() => {
      return props.filterText;
    });
    // 选中节点
    const selectedKey = computed(() => {
      return props.selectedKey;
    });
    // 展开节点
    const expandedKeys = ref<number[]>([]);
    // 节点点击事件
    const onTreeNodeClick = (node: EnergyAnomalyModule.AnomalyTree) => {
      if (node[disabledProps.disabledKey] === disabledProps.disabledValue) {
        return;
      }
      console.log(node);
      emit('onTreeSelect', node);
    };
    // 节点过滤
    const onTreeNodeFilter = (value: string, data: EnergyAnomalyModule.AnomalyTree) => {
      if (!value) return true;
      return data.treeName.indexOf(value) !== -1;
    };
    // 根据过滤文本处理树节点文本
    const formatTreeLabel = (label: string) => {
      return !filterStr.value ? label : label.replaceAll(filterStr.value, `<em>${filterStr.value}</em>`);
    };
    // 监听过滤文本变化
    watch(
      () => filterStr.value,
      newVal => {
        if (treeRef.value) {
          treeRef.value.filter(newVal);
        }
      },
    );
    /**
     * 监听数据变化---展开树节点
     */
    watch(
      () => props.treeDataSource,
      newVal => {
        expandedKeys.value =
          newVal?.length > 0
            ? getTreeExpandKeys<EnergyAnomalyModule.AnomalyTree[]>(props.treeDataSource, 'treeId', 'childTree')
            : [];
      },
    );
    /**
     * 初始化---获取展开节点
     */
    onMounted(() => {
      if (props.treeDataSource?.length) {
        expandedKeys.value = getTreeExpandKeys<EnergyAnomalyModule.AnomalyTree[]>(
          props.treeDataSource,
          'treeId',
          'childTree',
        );
      } else {
        expandedKeys.value = [];
      }
    });
    return {
      dataSource,
      disabledProps,
      nodeKey,
      loading,
      treeRef,
      expandedKeys,
      selectedKey,
      filterStr,

      onTreeNodeClick,
      onTreeNodeFilter,
      formatTreeLabel,
      FGetElTreeDefaultProps,
    };
  },
});
