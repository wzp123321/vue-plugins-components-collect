<!-- 树组件 -->
<template>
  <div class="tree-select">
    <!-- 下拉面板 start -->
    <div class="tree-select-panel">
      <!-- 树 start -->
      <div class="tree-select--box" :style="{ marginTop: showSearch ? '10px' : '0px' }">
        <el-tree
          v-loading="queryLoading"
          ref="treeRef"
          :data="treeData"
          :highlight-current="true"
          :node-key="nodeKey"
          :check-on-click-node="false"
          :expand-on-click-node="false"
          :check-strictly="strictly"
          :filter-node-method="filtertreeNodeList"
          :default-expanded-keys="expanedKeys"
          :default-expand-all="defaultExpandAll"
          :props="defaultProps"
          :default-checked-keys="checkedArr"
          @node-click="onNodeClick"
          @check="onCheck"
          show-checkbox
        >
        </el-tree>
      </div>
      <!-- 树 end -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, unref, nextTick, PropType, computed, reactive, toRefs } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash';

export interface RadioData {
  value: number | string | Boolean;
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
      default: 20,
    },
    showSearch: {
      // 是否显示搜索框
      type: Boolean,
      default: false,
    },
    expanedKeys: {
      // 默认展开节点集合
      type: Array,
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
    // 弹框width
    dialogWidth: {},
    // 默认展开全部
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    // 接收switchButton的值
    buttonValue: {
      //   type: Number,
      default: false,
    },
    // 父子是否相关
    strictly: {
      default: true,
      type: Boolean,
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
    const treeRef = ref(ElTree);
    // loading
    const queryLoading = computed(() => {
      return props.loading;
    });
    const strictly = computed(() => {
      return props.strictly;
    });
    // 宽度
    const computedWidth = computed(() => {
      return props.dialogWidth;
    });
    // buttonValue选项
    let buttonValue = props.buttonValue;
    /**
     * 单选按钮切换事件
     */
    const radioChange = (value: any) => {
      treeSelectState.searchValue = '';
      emit('update:radioValue', value);
      emit('tree-radio-change');
    };
    // 递归方法
    const readNodes = (nodes: any = [], arr: any = []) => {
      // let arr:any=[]
      for (let item of nodes) {
        arr.push(item.data && item.data.id);
        if (item.childNodes && item.childNodes.length) readNodes(item.childNodes, arr);
      }
      return arr;
    };

    /**
     * 节点点击事件----非多选时触发
     * 参数类型后续需要参考源码进行补充
     */
    const onNodeClick = (data: GlobalModule.CommonObject, node: any, self: any) => {
      if (props.multiple) {
        return;
      }
      emit('update:modelValue', data && data[props.nodeKey] ? [data[props.nodeKey]] : []);
      emit('select-change');
      treeSelectState.popoverVisible = false;
    };
    /**
     * 复选框状态改变触发
     */
    let index = ref<number>(1);
    const onCheck = async (data: GlobalModule.CommonObject, tree: GlobalModule.CommonObject) => {
      if (!props.multiple) {
        return;
      }
      let thisNode = treeRef.value.getNode(data.id); // 获取当前节点
      let thatNode = treeRef.value.getNode(data.id);
      let keys = treeRef.value.getCheckedKeys(); // 获取已勾选节点的key值
      let arrs = thisNode.childNodes;
      if (thisNode.checked) {
        // 当前节点若被选中
        for (let i = thisNode.level; i > 1; i--) {
          // 判断是否有父级节点
          if (!thisNode.parent.checked) {
            // 父级节点未被选中，则将父节点替换成当前节点，往上继续查询，并将此节点key存入keys数组
            thisNode = thisNode.parent;
            keys.push(thisNode.data.id);
          }
        }
      }
      treeRef.value.setCheckedKeys(keys);
      if (!thatNode.checked) {
        let tempArr = readNodes(arrs); //接收子树的id
        // 去除掉共有的
        keys = keys.filter(function (item: number) {
          return tempArr.indexOf(item) == -1;
        });
        treeRef.value.setCheckedKeys(keys);
      }
      emit('selectedTreeParentData', keys);
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
    const filtertreeNodeList = (value: any, data: any) => {
      if (!value) return true;
      return data.hasOwnProperty(props.defaultProps.label)
        ? data[props.defaultProps.label].indexOf(value) !== -1
        : true;
    };
    /**
     * 监听数据变化
     */
    watch(
      () => props.modelValue,
      (newVal, oldVal) => {
        treeSelectState.checkedArr = newVal;
        nextTick(() => {
          const tree = unref(treeRef);
          if (!tree) {
            return;
          }
          if (props.multiple) {
            tree.setCheckedKeys(newVal, false);
            const checkData = tree.getCheckedNodes();
            treeSelectState.treeNodeList = checkData || [];
          } else {
            tree.setCurrentKey(newVal.length > 0 ? newVal[0] : null, false);
            const checkData = tree.getCurrentNode();
            treeSelectState.treeNodeList = checkData ? [checkData] : [];
          }
        });
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

    return {
      ...toRefs(treeSelectState),
      queryLoading,
      //   allowClear,
      treeRef,
      //   treeType,
      defaultExpandAll,
      onNodeClick,
      onCheck,
      filtertreeNodeList,
      deleteSelectKey,
      emptySelectKeys,
      radioChange,
      computedWidth,
      buttonValue,
      strictly,
      index,
    };
  },
});
</script>

<style lang="less" scoped>
.tree-select {
  // width: 272px;
  height: 40px;
  .el-select {
    .tree-select--wrap {
      width: 240px;
      min-height: 40px;
      line-height: 40px;
      font-size: 14px;
      padding: 0 26px 0px 4px;
      background-color: var(--iot-font-color-white);
      background-image: none;
      border-radius: 4px;
      border: 1px solid var(--iot-border-color);
      overflow-y: auto;
      display: flex;
      .el-select__single {
        text-indent: 11px;
        color: var(--iot-font-color-root);
        overflow: hidden;
        white-space: nowrap;
        word-break: break-word;
      }
      .el-select__tags {
        position: inherit;
        top: inherit;
        transform: none;
      }
      .el-select-placeholder {
        text-indent: 11px;
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}
.tree-select-panel {
  .tree-radio--box {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }
  .tree-select--box {
    max-height: 500px;
    // overflow: auto;
    // background:red;
    :deep(.el-tree-node) {
      width: fit-content;
      min-width: 100%;
    }
  }
}
</style>
