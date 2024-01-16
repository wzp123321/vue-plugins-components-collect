import { defineComponent, ref, watch, unref, nextTick, PropType, computed, reactive, toRefs, onMounted } from 'vue';
import { getTreeExpandKeys } from '@/utils/index';
import { ElTree } from 'element-plus';

export interface RadioData {
  value: number | string | boolean;
  label: string;
}

interface TreeSelectState {
  popoverVisible: boolean;
  searchValue: string;
  treeNodeList: GlobalModule.CommonObject[];
  checkedArr: number[] | string[];
}
export default defineComponent({
  name: 'TreeSelect',
  props: {
    treeData: {
      // 数据源
      type: Array as PropType<GlobalModule.CommonObject[]>,
      default: [],
    },
    radioValue: {
      // 单选默认选中值
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      default: '',
    },
    radioData: {
      // 单选数据源
      type: Array as PropType<RadioData[]>,
      default: [],
    },
    showSearch: {
      // 是否显示搜索框
      type: Boolean,
      default: false,
    },
    expanedKeys: {
      // 默认展开节点集合
      type: Array as PropType<string[] | number[]>,
      default: [],
    },
    nodeKey: {
      // 数据源中每条数据唯一标识key
      type: String,
      default: 'id',
    },
    defaultProps: {
      // 配置选项
      type: Object,
      default: {
        children: 'children',
        label: 'label',
      },
    },
    placeholder: {
      // palcehoder文案
      type: String,
      default: '请选择节点',
    },
    modelValue: {
      // 默认勾选
      type: Array as PropType<number[] | string[]>,
      default: [],
    },
    // 切换radio 请求loading
    loading: {
      type: Boolean,
      default: false,
    },
    // 是否允许清空
    allowClear: {
      type: Boolean,
      default: true,
    },
    // 容器宽度
    width: {
      type: String,
      default: '240px',
    },
    // 默认展开全部
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    // popover offset距离
    popoverOffset: {
      type: Number,
      default: 4,
    },
    // 是否自适应
    autoWidth: {
      type: Boolean,
      default: false,
    },
    // 禁用key
    disabledKey: {
      type: String,
      default: '',
    },
    // 禁用value
    disabledValue: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const { defaultExpandAll } = props;
    const treeSelectState = reactive<TreeSelectState>({
      popoverVisible: false,
      searchValue: '',
      treeNodeList: [],
      checkedArr: [],
    });
    // 独立id
    const containerId = computed(() => {
      return `ts-container_${Number(Math.random() * 10000).toFixed(0)}`;
    });
    // 独立类名
    const popoverClass = computed(() => {
      return `popover-tree_${Number(Math.random() * 10000).toFixed(0)}`;
    });
    // 禁用value
    const disabledValue = computed(() => {
      return props.disabledValue;
    });
    // 禁用key
    const disabledKey = computed(() => {
      return props.disabledKey;
    });
    const treeRef = ref(ElTree);
    // 是否允许清空
    const allowClear = computed(() => {
      return props.allowClear;
    });
    // 是否展示搜索框
    const showSearch = computed(() => {
      return props.showSearch;
    });
    // loading
    const queryLoading = computed(() => {
      return props.loading;
    });
    // radio 类型
    const treeType = computed(() => {
      return props.radioValue;
    });
    // popover offset距离
    const popoverOffset = computed(() => {
      return props.popoverOffset;
    });
    // 宽度
    const width = computed(() => {
      return props.width;
    });
    // 计算出输入框的宽度
    const containerWidth = ref(props.width);
    // 展开keys
    const compExpandKeys = ref<number[] | string[]>(props.expanedKeys);
    /**
     * 单选按钮切换事件
     */
    const radioChange = (value: any) => {
      treeSelectState.searchValue = '';
      emit('update:radioValue', value);
      emit('tree-radio-change');
    };
    // /**
    //  * 自定义渲染节点
    //  * @param h 渲染函数
    //  * @param param1
    //  */
    // const renderContent = (
    //   h: any,
    //   { node, data, store }: GlobalModule.CommonObject,
    // ) => {
    //   return h(
    //     'span',
    //     {
    //       class: ['el-tree-node__label'],
    //       disabled: props.disabledKey
    //         ? data[props.disabledKey] === props.disabledValue
    //         : false,
    //     },
    //     [h('em')],
    //     // !treeSelectState.searchValue
    //     //   ? data[props.defaultProps.label]
    //     //   : data[props.defaultProps.label].replaceAll(
    //     //       treeSelectState.searchValue,
    //     //       `<em>${treeSelectState.searchValue}</em>`,
    //     //     ),
    //   );
    // };
    // 根据过滤文本处理树节点文本
    const formatTreeLabel = (label: string) => {
      return !treeSelectState.searchValue
        ? label
        : label.replaceAll(treeSelectState.searchValue, `<em>${treeSelectState.searchValue}</em>`);
    };
    /**
     * 节点点击事件----非多选时触发
     * 参数类型后续需要参考源码进行补充
     */
    const onNodeClick = (data: GlobalModule.CommonObject) => {
      if (props.disabledKey && data[props.disabledKey] === props.disabledValue) {
        return;
      }
      emit('update:modelValue', data && data[props.nodeKey] ? [data[props.nodeKey]] : []);
      emit('select-change');
      treeSelectState.popoverVisible = false;
    };
    /**
     * 清空事件
     */
    const emptySelectKeys = (e: any) => {
      e.stopPropagation();
      treeSelectState.checkedArr = [];
      emit('update:modelValue', []);
      emit('select-change');
    };
    /**
     * 树节点查询筛选
     */
    const filtertreeNodeList = (value: any, data: any) => {
      if (!value) {
        return true;
      }
      return data.hasOwnProperty(props.defaultProps.label)
        ? data[props.defaultProps.label].indexOf(value) !== -1
        : true;
    };
    /**
     * 监听数据变化
     */
    watch(
      () => props.modelValue,
      newVal => {
        treeSelectState.checkedArr = newVal;
        nextTick(() => {
          const tree = unref(treeRef);
          if (!tree || props.treeData?.length === 0) {
            treeSelectState.treeNodeList = [];
            return;
          }
          tree.setCurrentKey(newVal.length > 0 ? newVal[0] : null, false);
          const checkData = tree.getCurrentNode();
          treeSelectState.treeNodeList = checkData ? [checkData] : [];
        });
      },
      {
        immediate: true,
      },
    );
    /**
     * 监听查询输入
     */
    watch(
      () => treeSelectState.searchValue,
      (val: any) => {
        if (props.showSearch) {
          treeRef.value.filter(val);
        }
      },
    );
    /**
     * 监听展开
     * 如果上层传了 直接用 如果没有则调方法生成
     */
    watch(
      () => props.treeData,
      () => {
        treeSelectState.searchValue = '';
        compExpandKeys.value = props.expanedKeys?.length
          ? props.expanedKeys
          : getTreeExpandKeys<GlobalModule.CommonObject[]>(props.treeData, props.nodeKey, props.defaultProps.children);

        containerWidth.value = props.width;
      },
      {
        immediate: true,
      },
    );

    return {
      ...toRefs(treeSelectState),
      containerId,
      queryLoading,
      allowClear,
      treeRef,
      treeType,
      defaultExpandAll,
      compExpandKeys,
      popoverOffset,
      width,
      showSearch,
      containerWidth,
      popoverClass,
      disabledValue,
      disabledKey,

      onNodeClick,
      filtertreeNodeList,
      emptySelectKeys,
      radioChange,
      formatTreeLabel,
    };
  },
});
