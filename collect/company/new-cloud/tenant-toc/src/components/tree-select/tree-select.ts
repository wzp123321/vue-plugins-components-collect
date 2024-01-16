import {
  defineComponent,
  ref,
  watch,
  nextTick,
  PropType,
  computed,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
} from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import { getTreeExpandKeys } from '@/utils/index';
import { cloneDeep } from 'lodash';
import elementResizeDector from 'element-resize-detector';

import { ArrowDown, ArrowUp,  } from '@element-plus/icons-vue';
import message from '@/utils/message';

const erd = elementResizeDector();

export interface RadioData {
  value: number | string | boolean;
  label: string;
}

const MIN_WIDTH = 240;

interface TreeSelectState {
  popoverVisible: boolean;
  searchValue: string;
  treeNodeList: GlobalModule.CommonObject[];
  checkedArr: number[] | string[];
}
export default defineComponent({
  name: 'TreeSelect',
  components: {
    ArrowDown,
    ArrowUp,
  },
  props: {
    treeData: {
      // 数据源
      type: Array as PropType<GeneralModule.TreeInfo[]>,
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
      type: [String, Number, Boolean, null] as PropType<string | number | boolean | null>,
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
    expandedKeys: {
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
    nameSpace: {
      type: String,
      default: '分析对象',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
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
      return `ts-container_${Number(Math.random() * 100000000).toFixed(0)}`;
    });
    // 独立类名
    const popoverClass = computed(() => {
      return `popover-tree_${Number(Math.random() * 100000000).toFixed(0)}`;
    });
    const treeRef = ref();
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
    // 是否为多选
    const multiple = computed(() => {
      return props.multiple;
    });
    // radio 类型
    const treeType = computed(() => {
      return props.radioValue;
    });
    // popover offset距离
    const popoverOffset = computed(() => {
      return props.popoverOffset;
    });
    // 是否禁用
    const disabled = computed(() => {
      return props.disabled;
    });
    // 计算出输入框的宽度
    const containerWidth = ref(`${MIN_WIDTH}px`);
    // 展开keys
    const compExpandKeys = ref<number[] | string[]>(props.expandedKeys);
    /**
     * 根据当前dom的位置以及处理距离 获取placement
     */
    const placement = ref<'bottom' | 'top' | 'left'>('bottom');
    /**
     * 单选按钮切换事件
     */
    const radioChange = (value: any) => {
      treeSelectState.searchValue = '';
      emit('update:radioValue', value);
      emit('tree-radio-change', value);
    };
    /**
     * 节点点击事件----非多选时触发
     * 参数类型后续需要参考源码进行补充
     */
    const onNodeClick = (data: GlobalModule.CommonObject) => {
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
      if (checkedKeys && checkedKeys.length > props.maxLength) {
        treeRef.value?.setCheckedKeys(props.modelValue, false);
        message.error(`${props.nameSpace}最多可选择${props.maxLength}个`);
        return;
      }
      treeRef.value?.setCheckedKeys(checkedKeys, false);
      emit('update:modelValue', checkedKeys);
      emit('select-change');
    };

    /**
     * 多选单个删除
     */
    const deleteSelectKey = (e: Event, index: number) => {
      e.stopPropagation();
      const list = cloneDeep(treeSelectState.checkedArr);
      list.splice(index, 1);
      emit('update:modelValue', list);
      emit('select-change');
    };
    /**
     * 清空事件
     */
    const emptySelectKeys = (e: Event) => {
      e.stopPropagation();
      treeSelectState.checkedArr = [];
      emit('update:modelValue', []);
      emit('select-change');
    };
    /**
     * 树节点查询筛选
     */
    const filtertreeNodeList = (value: string, data: any) => {
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
    // 获取距离顶部高度
    const getPopoverPlacement = (newVal: boolean) => {
      nextTick(() => {
        if (newVal) {
          const paddingBottom = 48;
          // 整体高度
          const scrollHeight = window.innerHeight;
          const ele = document.getElementById(containerId.value);
          if (!ele) {
            placement.value = 'bottom';
            return;
          }
          // 弹出层高度
          const popoerEle = document.getElementsByClassName(`${popoverClass.value}`);
          const h = popoerEle[0]?.getBoundingClientRect()?.height as number;

          // 距离顶部高度
          const top = ele?.getBoundingClientRect().top;
          placement.value = scrollHeight - top - paddingBottom > h ? 'bottom' : top < h ? 'left' : 'top';
        }
      });
    };
    // 获取容器宽度
    const getContainerWidth = () => {
      nextTick(() => {
        const element = document.querySelector(`#${containerId.value}`);
        if (!element) {
          return;
        }
        const widthStr = getComputedStyle(element).getPropertyValue('width');
        const w = Math.max(Number(widthStr.replace('px', '')), MIN_WIDTH);
        containerWidth.value = `${w - 2}px`; // 减去容器边框 减去后缀icon宽度
      });
    };
    /**
     * 监听数据变化
     */
    watch(
      () => props.modelValue,
      (newVal) => {
        treeSelectState.checkedArr = newVal;
        nextTick(() => {
          if (!treeRef.value || !props.treeData || props.treeData?.length === 0) {
            treeSelectState.treeNodeList = [];
            return;
          }
          treeSelectState.treeNodeList = [];
          if (props.multiple) {
            treeRef.value?.setCheckedKeys(newVal, false);
            if (newVal.length > 0) {
              newVal.forEach((item: any) => {
                const node = treeRef.value?.getNode(item);
                if (node?.data) {
                  treeSelectState.treeNodeList.push(node?.data);
                }
              });
            } else {
              treeSelectState.treeNodeList = [];
            }
          } else {
            if (!treeRef.value) {
              return;
            }
            treeRef.value?.setCurrentKey(newVal.length > 0 ? newVal[0] : null, false);
            if (newVal.length > 0) {
              newVal.forEach((item: any) => {
                const node = treeRef.value?.getNode(item);
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
      (val: any) => {
        treeSelectState.searchValue = '';
        compExpandKeys.value = props.expandedKeys?.length
          ? props.expandedKeys
          : getTreeExpandKeys(props.treeData, props.nodeKey, props.defaultProps.children);
      },
      {
        immediate: true,
      },
    );
    watch(
      () => treeSelectState.popoverVisible,
      (newVal) => {
        if (newVal) {
          nextTick(() => {
            getPopoverPlacement(newVal);
          });
        }
      },
    );

    onMounted(() => {
      nextTick(() => {
        const dom = document.getElementById(`${containerId.value}`);
        if (!dom) {
          return;
        }
        erd.listenTo(dom, getContainerWidth);
      });
    });
    onUnmounted(() => {
      const dom = document.getElementById(`${containerId.value}`);
      if (!dom) {
        return;
      }
      erd.removeListener(dom, getContainerWidth);
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
      multiple,
      showSearch,
      containerWidth,
      popoverClass,
      disabled,
      placement,

      onNodeClick,
      onCheck,
      filtertreeNodeList,
      deleteSelectKey,
      emptySelectKeys,
      radioChange,
      formatTreeLabel,
    };
  },
});
