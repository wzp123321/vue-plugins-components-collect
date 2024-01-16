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
  onMounted,
  toRef,
  onUnmounted,
} from 'vue';
import { ElTree, ElTreeV2 } from 'element-plus';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';

import { cloneDeep } from 'lodash';
import useCurrentInstance from '@/utils/use-current-instance';
import { getTreeExpandKeys } from '@/utils/index';

import { CommonObject } from '../../services/common/common-api';

export interface RadioData {
  value: number | string | boolean;
  label: string;
}

interface TreeSelectState {
  popoverVisible: boolean;
  searchValue: string;
  treeNodeList: CommonObject[];
  checkedArr: number[] | string[];
}
export default defineComponent({
  name: 'TreeSelect',
  components: {
    ArrowDown,
    ArrowUp,
    'el-tree-v2': ElTreeV2,
  },
  props: {
    treeData: {
      // 数据源
      type: Array as PropType<CommonObject[]>,
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
    nameSpace: {
      type: String,
      default: '分析对象',
    },
    disabledProps: {
      type: Object as PropType<{ disabledKey: string; disabledValue: string | number }>,
      default: { disabledKey: 'id', disabledValue: '' },
    },
    // 是否把选中的节点展示到可视区域
    scrollIntoView: {
      type: Boolean,
      default: false,
    },
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
      return `ts-container_${Number(Math.random() * 10000).toFixed(0)}`;
    });
    // 独立类名
    const popoverClass = computed(() => {
      return `popover-tree_${Number(Math.random() * 10000).toFixed(0)}`;
    });
    const treeRef = ref();
    // 是否允许清空
    const allowClear = computed<boolean>(() => {
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
    // 宽度
    const width = computed(() => {
      return props.width;
    });
    // 是否禁用
    const disabled = computed(() => {
      return props.disabled;
    });
    // 禁用字段
    const disabledProps = toRef(props, 'disabledProps');
    // 计算出输入框的宽度
    const containerWidth = ref<string>(props.width);
    // 最小宽度 即下拉框容器的宽度
    const minWidth = ref(props.width);
    // 展开keys
    const compExpandKeys = ref<number[] | string[]>(props.expanedKeys);
    // 处理数据显示
    /**
     * 单选按钮切换事件
     */
    const radioChange = (value: any) => {
      if (props.disabled) {
        return;
      }

      treeSelectState.searchValue = '';
      emit('update:radioValue', value);
      emit('tree-radio-change', value);
    };
    /**
     * 节点点击事件----非多选时触发
     * 参数类型后续需要参考源码进行补充
     */
    const onNodeClick = (data: CommonObject) => {
      if (data[props.disabledProps.disabledKey] === props.disabledProps.disabledValue || props.disabled) {
        return;
      }
      if (props.multiple) {
        let keys = cloneDeep(props.modelValue) as any;
        if (props.modelValue.includes(data[props.nodeKey] as never)) {
          keys = keys.filter((item: any) => {
            return item !== data[props.nodeKey];
          });
          emit('update:modelValue', keys);
          emit('select-change', keys);
        } else {
          if (props.modelValue?.length < props.maxLength) {
            keys.push(data[props.nodeKey]);
            emit('update:modelValue', keys);
            emit('select-change', keys);
          } else {
            proxy.$message.error(`分析对象最多可选择${props.maxLength}个`);
          }
        }
        return;
      }
      emit('update:modelValue', data && data[props.nodeKey] ? [data[props.nodeKey]] : []);
      emit('select-change', data && data[props.nodeKey] ? [data[props.nodeKey]] : [], data?.[props.defaultProps.label]);
      //单选整项
      emit('select-item', data);
      treeSelectState.popoverVisible = false;
    };
    /**
     * 复选框状态改变触发
     */
    const onCheck = (data: CommonObject, tree: CommonObject) => {
      if (
        !props.multiple ||
        props.disabled ||
        data[props.disabledProps.disabledKey] === props.disabledProps.disabledValue
      ) {
        return;
      }
      const { checkedKeys } = tree;
      const rTree = unref(treeRef);
      if (checkedKeys && checkedKeys.length > props.maxLength) {
        rTree.setCheckedKeys(props.modelValue, false);
        proxy.$message.error(`${props.nameSpace}最多可选择${props.maxLength}个`);
        return;
      }
      rTree.setCheckedKeys(checkedKeys, false);
      emit('update:modelValue', checkedKeys);
      emit('select-change', checkedKeys);
    };

    /**
     * 多选单个删除
     */
    const deleteSelectKey = (e: any, index: number) => {
      e.stopPropagation();
      if (props.disabled) {
        return;
      }

      const list = cloneDeep(treeSelectState.checkedArr);
      list.splice(index, 1);
      emit('update:modelValue', list);
      emit('select-change', list);
    };
    /**
     * 清空事件
     */
    const emptySelectKeys = (e: any) => {
      e.stopPropagation();
      if (props.disabled) {
        return;
      }
      treeSelectState.checkedArr = [];
      emit('update:modelValue', []);
      emit('select-change', []);
    };
    /**
     * 树节点查询筛选
     */
    const filtertreeNodeList = (value: any, data: any, node: any) => {
      if (!value) return true;
      return data[props.defaultProps.label].includes(value);
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
    // 获取选中的节点
    const getTreeNodeList = () => {
      if (!treeRef.value || props.modelValue?.length === 0) {
        treeSelectState.treeNodeList = [];
        treeRef.value?.setCheckedKeys(props.modelValue, false);
        return;
      }
      nextTick(() => {
        treeSelectState.treeNodeList = [];
        if (props.multiple) {
          treeRef.value?.setCheckedKeys(props.modelValue, false);
          if (props.modelValue.length > 0) {
            treeSelectState.treeNodeList = treeRef.value?.getCheckedNodes();
          } else {
            treeSelectState.treeNodeList = [];
          }
        } else {
          if (treeRef.value) {
            treeRef.value?.setCurrentKey(props.modelValue.length > 0 ? props.modelValue[0] : null, false);
            if (props.modelValue.length > 0) {
              treeSelectState.treeNodeList.push(treeRef.value?.getCurrentNode());
            } else {
              treeSelectState.treeNodeList = [];
            }
            //单选整项
            emit('select-item', treeSelectState.treeNodeList[0]);
          }
        }
      });
    };

    // 监听popover的显示，
    watch(
      () => treeSelectState.popoverVisible,
      (newVal) => {
        if (newVal) {
          treeSelectState.searchValue = '';
        }
        if (newVal && props.scrollIntoView) {
          nextTick(() => {
            document.querySelector('.custom-tree-node-active')?.scrollIntoView({ block: 'center' });
          });
        }

        if (treeRef.value) {
          treeRef.value.itemSize = 34;
        }
      },
    );
    /**
     * 监听数据变化
     */
    watch(
      () => props.modelValue,
      (newVal) => {
        treeSelectState.checkedArr = cloneDeep(newVal);
        nextTick(() => {
          getTreeNodeList();
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
        if (props.showSearch && props.treeData?.length > 0) {
          if (treeRef.value) {
            console.log('val-----------', val, treeRef.value);
            treeRef.value.filter(val);
          }
        }
      },
    );

    watch(
      () => props.treeData,
      (val: any) => {
        compExpandKeys.value = cloneDeep(props.expanedKeys);

        nextTick(() => {
          getTreeNodeList();
        });
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
      disabledProps,
      disabled,

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
