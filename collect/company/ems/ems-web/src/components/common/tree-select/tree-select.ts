import {
  defineComponent,
  ref,
  watch,
  unref,
  nextTick,
  PropType,
  computed,
  reactive,
  toRefs,
  toRef,
  onMounted,
  onUnmounted,
} from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import { getTreeExpandKeys } from '@/utils/index';
import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash';

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
    multiple: {
      // 是否多选
      type: Boolean,
      default: false,
    },
    maxLength: {
      // 多选时最多可以选择几个
      type: Number,
      default: 10,
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
      type: Array as PropType<number[]>,
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
      type: Array as PropType<number[]>,
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
    nameSpace: {
      type: String,
      default: '分析对象',
    },
    disabledProps: {
      type: Object as PropType<{ disabledKey: string; disabledValue: string | number }>,
      default: { disabledKey: 'id', disabledValue: '' },
    },
  },
  setup(props, { emit }) {
    const { defaultExpandAll } = props;
    const { proxy } = useCurrentInstance();
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
    // 独立类名
    const activeNodeClass = computed(() => {
      return `active-tree-node_${Number(Math.random() * 10000).toFixed(0)}`;
    });
    const treeRef = ref(ElTree);
    // 是否允许清空
    const allowClear = toRef(props, 'allowClear');
    // 是否展示搜索框
    const showSearch = toRef(props, 'showSearch');
    // loading
    const queryLoading = toRef(props, 'loading');
    // 是否为多选
    const multiple = toRef(props, 'multiple');
    // radio 类型
    const treeType = toRef(props, 'radioValue');
    // popover offset距离
    const popoverOffset = toRef(props, 'popoverOffset');
    // 宽度
    const width = toRef(props, 'width');
    // 计算出输入框的宽度
    const containerWidth = ref(props.width);
    // 最小宽度 即下拉框容器的宽度
    const minWidth = ref(props.width);
    // 展开keys
    const compExpandKeys = ref<number[]>([]);
    /**
     * 单选按钮切换事件
     */
    const radioChange = (value: any) => {
      treeSelectState.searchValue = '';
      emit('update:radioValue', value);
      emit('tree-radio-change');
    };
    /**
     * 节点点击事件----非多选时触发
     * 参数类型后续需要参考源码进行补充
     */
    const onNodeClick = (data: GlobalModule.CommonObject) => {
      if (data[props.disabledProps.disabledKey] === props.disabledProps.disabledValue) {
        return;
      }
      if (props.multiple) {
        let keys = cloneDeep(props.modelValue) as any;
        if (props.modelValue.includes(data[props.nodeKey] as never)) {
          keys = keys.filter((item: any) => {
            return item !== data[props.nodeKey];
          });
          emit('update:modelValue', keys);
          emit('select-change');
        } else {
          if (props.modelValue?.length < props.maxLength) {
            keys.push(data[props.nodeKey]);
            emit('update:modelValue', keys);
            emit('select-change');
          } else {
            proxy.$message.error(`分析对象最多可选择${props.maxLength}个`);
          }
        }
        return;
      }
      emit('update:modelValue', data && data[props.nodeKey] ? [data[props.nodeKey]] : []);
      emit('select-change');
      treeSelectState.popoverVisible = false;
    };
    /**
     * 复选框状态改变触发
     */
    const onCheck = (data: GlobalModule.CommonObject, tree: GlobalModule.CommonObject) => {
      if (!props.multiple) {
        return;
      }

      const { checkedKeys } = tree;
      const rTree = unref(treeRef);
      if (data[props.disabledProps.disabledKey] === props.disabledProps.disabledValue) {
        rTree.setCheckedKeys(props.modelValue, false);

        return;
      }

      if (checkedKeys && checkedKeys.length > props.maxLength) {
        rTree.setCheckedKeys(props.modelValue, false);
        proxy.$message.error(`${props.nameSpace}最多可选择${props.maxLength}个`);
        return;
      }
      rTree.setCheckedKeys(checkedKeys, false);
      emit('update:modelValue', checkedKeys);
      emit('select-change');
    };

    /**
     * 多选单个删除
     */
    const deleteSelectKey = (e: any, index: number) => {
      e.stopPropagation();
      const list = cloneDeep(treeSelectState.checkedArr);
      list.splice(index, 1);
      emit('update:modelValue', list);
      emit('select-change');
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
    const filterTreeNodeList = (value: any, data: any) => {
      if (!value) return true;
      return data.hasOwnProperty(props.defaultProps.label)
        ? data[props.defaultProps.label].indexOf(value) !== -1
        : true;
    };
    // 根据过滤文本处理树节点文本
    const formatTreeLabel = (label: string) => {
      return !treeSelectState.searchValue
        ? label
        : label.replaceAll(treeSelectState.searchValue, `<em>${treeSelectState.searchValue}</em>`);
    };
    // 获取容器宽度
    const getContainerWidth = () => {
      if (props.autoWidth) {
        nextTick(() => {
          const element = document.querySelector(`#${containerId.value}`);
          if (!element) {
            return;
          }
          const widthStr = getComputedStyle(element).getPropertyValue('width');
          const w = Number(widthStr.replace('px', ''));
          containerWidth.value = `${w - 2}px`; // 减去容器边框 减去后缀icon宽度
        });
      } else {
        containerWidth.value = props.width; // 减去容器边框 减去后缀icon宽度
      }
    };
    /**
     * 弹出层打开
     * 默认展开勾选节点的所有父节点
     */
    const handlePopoverShow = () => {
      // // 滚动到可视区域
      // if (props?.modelValue?.length) {
      //   const node = treeRef.value?.getNode(props.modelValue?.[0]);
      //   const pIds = node?.data?.parentIds?.split(',') ?? [];
      //   if (pIds?.length) {
      //     compExpandKeys.value = [...compExpandKeys.value, ...pIds?.map((item: string) => Number(item))];
      //     compExpandKeys.value = Array.from(new Set(compExpandKeys.value));
      //   }
      // }
      // setTimeout(() => {
      //   document
      //     .querySelector(`.custom-tree-node-active.${activeNodeClass.value}`)
      //     ?.scrollIntoView({ block: 'center' });
      // }, 666);
    };
    /**
     * 监听数据变化
     */
    watch(
      () => props.modelValue,
      (newVal) => {
        treeSelectState.checkedArr = newVal;
        nextTick(() => {
          const tree = unref(treeRef);
          if (!tree || props.treeData?.length === 0) {
            treeSelectState.treeNodeList = [];
            return;
          }
          treeSelectState.treeNodeList = [];
          if (props.multiple) {
            tree.setCheckedKeys(newVal, false);
            if (newVal.length > 0) {
              newVal.forEach((item: any) => {
                const node = tree?.getNode(item);
                if (node?.data) {
                  treeSelectState.treeNodeList.push(node?.data);
                }
              });
            } else {
              treeSelectState.treeNodeList = [];
            }
          } else {
            tree.setCurrentKey(newVal.length > 0 ? newVal[0] : null, false);
            if (newVal.length > 0) {
              newVal.forEach((item: any) => {
                const node = tree?.getNode(item);
                if (node?.data) {
                  treeSelectState.treeNodeList.push(node?.data);
                }
              });
            } else {
              treeSelectState.treeNodeList = [];
            }
          }
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
        if (props.showSearch && props.treeData?.length) {
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
      (val: any) => {
        treeSelectState.searchValue = '';
        if (compExpandKeys.value?.length === 0 && !props.defaultExpandAll) {
          compExpandKeys.value = getTreeExpandKeys<GlobalModule.CommonObject[]>(
            props.treeData,
            props.nodeKey,
            props.defaultProps.children,
          );
        }
      },
      {
        immediate: true,
      },
    );
    watch(
      () => props.expanedKeys,
      () => {
        compExpandKeys.value = props.expanedKeys;
      },
      {
        immediate: true,
      },
    );
    watch(
      () => treeSelectState.popoverVisible,
      (newVal) => {
        if (newVal) {
          // 展开节点
          if (props?.modelValue?.length) {
            const node = treeRef.value?.getNode(props.modelValue?.[0]);
            const pIds = node?.data?.parentIds?.split(',') ?? [];
            if (pIds?.length) {
              compExpandKeys.value = [...compExpandKeys.value, ...pIds?.map((item: string) => Number(item))];
              compExpandKeys.value = Array.from(new Set(compExpandKeys.value));
            }
          }
          setTimeout(() => {
          // 滚动到可视区域
            document
              .querySelector(`.custom-tree-node-active.${activeNodeClass.value}`)
              ?.scrollIntoView({ block: 'center' });
          }, 36);
        }
      },
    );

    onMounted(() => {
      nextTick(() => {
        getContainerWidth();
      });

      window.addEventListener('resize', getContainerWidth);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', getContainerWidth);
    });

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
      multiple,
      showSearch,
      containerWidth,
      popoverClass,
      minWidth,
      activeNodeClass,

      onNodeClick,
      onCheck,
      filterTreeNodeList,
      handlePopoverShow,
      deleteSelectKey,
      emptySelectKeys,
      radioChange,
      formatTreeLabel,
    };
  },
});
