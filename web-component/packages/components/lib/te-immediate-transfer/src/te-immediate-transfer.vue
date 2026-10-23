<template>
  <div class="te-immediate-transfer">
    <section>
      <!-- 左侧未选全部列表 -->
      <div class="te-immediate-transfer-left">
        <te-tabs
          v-if="tabs?.length > 0"
          type="border-card"
          v-model:model-value="tabsValue"
        >
          <te-tab-pane
            v-for="(item, index) in tabs"
            :label="item.title"
            :name="index"
          >
            <te-immediate-transfer-tree-item
              :title="treeTitle"
              ref="treeItemRef"
              show-checkbox
              check-on-click-node
              :node-key="nodeKey"
              :check-strictly="strictly"
              :default-expanded-keys="expanedKeys"
              :default-expand-all="defaultExpandAll"
              :props="defaultProps"
              :data="item.data"
              :is-tree-v2="isTreeV2"
              @check="onCheck"
              @node-click="(data, node) => emit('onLeftNodeClick', data, node)"
              v-bind="$attrs"
              :defaultCheckedKeys="modelValue.map((item) => item[getNodeKey()])"
            >
            </te-immediate-transfer-tree-item>
          </el-tab-pane>
        </el-tabs>
        <div class="te-immediate-transfer-left-no-tabs-container" v-else>
          <div
            class="ct-content-left-tree-header"
            :class="{
              'ct-content-left-tree-header-highlight': showHeadBgColor,
            }"
          >
            <te-checkbox
              v-if="showChooseAll"
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
            >
              {{ '待选' + '(' + prepareCheckedCount + ')' }}
            </el-checkbox>
            <span v-else>{{
              showLeftCount ? '待选' + '(' + prepareCheckedCount + ')' : '待选'
            }}</span>
            <te-dropdown
              @command="command"
              :teleported="false"
              v-if="showSwitchCheckMode"
            >
              <span class="te-dropdown-link">
                {{ strictly ? '任选' : '联选' }}
                <icon-down />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <te-dropdown-item :command="Common_EStrictlyStatus.联选"
                    >联选</te-dropdown-item
                  >
                  <te-dropdown-item :command="Common_EStrictlyStatus.任选"
                    >任选</te-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="left-tree-container">
            <te-immediate-transfer-tree-item
              :treeTitle="treeTitle"
              :showSearch="showLeftTreeSearch"
              ref="treeItemRef"
              show-checkbox
              check-on-click-node
              :node-key="nodeKey"
              :check-strictly="strictly"
              :defaultExpandedKeys="expanedKeys"
              :default-expand-all="defaultExpandAll"
              :props="defaultProps"
              :is-tree-v2="isTreeV2"
              @check="onCheck"
              @node-click="(data, node) => emit('onLeftNodeClick', data, node)"
              v-bind="$attrs"
              :defaultCheckedKeys="modelValue.map((item) => item[getNodeKey()])"
            >
            </te-immediate-transfer-tree-item>
            <slot name="leftLevelTree" />
          </div>
        </div>
      </div>

      <!-- 右侧已选列表 -->
      <div class="te-immediate-transfer-right">
        <CommonTransferChecked
          ref="checkedRef"
          :showSearch="showRightTreeSearch"
          :checkedDataList="checkedDataList"
          :show-head-bg-color="showHeadBgColor"
          :is-tree-v2="isTreeV2"
          @delete="deleteItem"
          @clear="clearSelected"
          :default-props="choosedProps ? choosedProps : defaultProps"
          :max-length="maxLength"
          :tabs="tabs"
          :show-parent-title="showParentTitle"
        ></CommonTransferChecked>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed, onMounted } from 'vue';
import {
  Common_ITreeItem,
  ITCheckListItem,
  Common_ERadioData,
  Common_EStrictlyStatus,
  TransferTabsItem,
} from './constants';
import CommonTransferChecked from './ctt-checked.vue';
import {
  ElMessage,
  ElCheckbox,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElTabs,
  ElTabPane,
} from 'element-plus';
import { IconDown } from '@arco-iconbox/vue-te';
import { cloneDeep } from 'lodash';
import TeImmediateTransferTreeItem from './components/left-tree-item.vue';
import {
  TreeData,
  TreeKey,
  TreeNodeData,
} from 'element-plus/es/components/tree-v2/src/types';
import { nextTick } from 'vue';

defineOptions({
  name: 'TeImmediateTransfer',
});

const emit = defineEmits([
  'update:modelValue',
  'onLeftNodeClick',
  'onDeleteNode',
  'onClearEvent',
]);
const props = defineProps({
  // //是否能清除
  // clearable: {
  //   type: Boolean,
  //   default: true,
  // },
  // 树节点数
  treeTotal: {
    type: Number,
    default: 0,
  },
  // 最多可选数量
  maxLength: {
    type: Number,
  },
  // 标签数
  maxTags: {
    type: Number,
    default: 2,
  },
  // 双向绑定已选数据
  modelValue: {
    type: Array as PropType<ITCheckListItem[]>,
    default: () => [],
  },
  //当前树类型
  radioValue: {
    type: Number,
    default: Common_ERadioData.区域,
  },
  // 默认展开节点集合
  expanedKeys: {
    type: Array as PropType<number[]>,
    default: [],
  },
  // 数据源中每条数据唯一标识key
  nodeKey: {
    type: String,
    default: 'id',
  },
  defaultProps: {
    // 配置选项
    type: Object,
    default: () => {
      return {
        children: 'children',
        label: 'label',
        id: 'id',
        value: 'id',
        parentTitle: 'parentTitle',
      };
    },
  },
  choosedProps: {
    // 已选列表属性映射配置选项
    type: Object as PropType<Object> | undefined,
    default: undefined,
  },
  // 默认展开全部
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  // 命名空间
  namespace: {
    type: String,
    default: '对象',
  },
  showSwitchCheckMode: {
    type: Boolean,
    default: false,
  },
  showHeadBgColor: {
    type: Boolean,
    default: true,
  },
  // 是否展示全选
  showChooseAll: {
    type: Boolean,
    default: true,
  },
  // 是否显示待选数量
  showLeftCount: {
    type: Boolean,
    default: true,
  },
  // 待选区tabs选项集合
  tabs: {
    type: Array as PropType<TransferTabsItem[]> | null,
    default: null,
  },
  leftSectionWidth: {
    type: String,
    default: '50%',
  },
  //是否任选
  strictlyProp: {
    type: Boolean,
    default: true,
  },
  // 已选是否过滤父节点
  filterParentNode: {
    type: Boolean,
    default: false,
  },
  treeTitle: {
    type: String,
    default: '',
  },
  showLeftTreeSearch: {
    type: Boolean,
    default: true,
  },
  showRightTreeSearch: {
    type: Boolean,
    default: true,
  },
  // 待选树是否采用虚拟树
  isTreeV2: {
    type: Boolean,
    default: false,
  },
  // 是否展示副标题
  showParentTitle: {
    type: Boolean,
    default: false,
  },
});

/**
 * 是否多选
 */
const checkAll = ref(false);
//是否任选
const strictly = ref(props.strictlyProp);
//全选中间状态
const isIndeterminate = ref(false);
// 选中的列表或节点
// const checkedValue = ref<number[]>([]);
//树
const treeItemRef = ref();
// 已选择的设备列表
const checkedDataList = ref<ITCheckListItem[]>([]);
//一维的列表
const treeList = ref<Common_ITreeItem[]>([]);
const tabsValue = ref(0);
let watchModelValue = true;

const prepareCheckedCount = computed(() => {
  return props.treeTotal - checkedDataList.value.length;
});

const rightWidth = computed(() => `calc(100% - ${props.leftSectionWidth})`);
const getNodeKey = (isChecked: Boolean = false) => {
  const nodeKey = props.isTreeV2
    ? isChecked
      ? props.choosedProps
        ? props.choosedProps.value
        : props.defaultProps.value
      : props.defaultProps.value
    : isChecked
    ? props.choosedProps
      ? props.choosedProps.id
      : props.defaultProps.id
    : props.defaultProps.id;
  return nodeKey;
};

/**
 * @description: 接口传入更新
 */
watch(
  () => treeItemRef.value?.treeRef?.$props.data,
  (newData) => {
    if (!treeItemRef.value?.treeRef || !newData) return;
    treeList.value = convertTreeData(cloneDeep(newData));
  },
  { deep: true },
);

onMounted(() => {
  console.log('测试版本');
  if (!props.tabs && !treeItemRef.value.treeRef.$props.lazy) {
    treeList.value = convertTreeData(
      cloneDeep(treeItemRef.value.treeRef.$props.data),
    );
  }
  /**
   * 重新设置上一次选中状态
   */
  updateCheckedNodes();
  for (const iterator of props.modelValue) {
    if (
      checkedDataList.value.filter(
        (item) => item[getNodeKey()] == iterator[getNodeKey()],
      )?.length <= 0
    ) {
      checkedDataList.value.push(iterator);
    }
  }
  updateCheckStatus();
});

/**
 * 切换选择方式
 * @param item
 */
const command = (item: string) => {
  strictly.value = item === Common_EStrictlyStatus.任选;
};

/**
 * 单个删除选中
 * @param item
 */
const deleteItem = (data: Common_ITreeItem) => {
  // 当前节点设置非选中状，，且联动子节点
  if (props.tabs) {
    treeItemRef.value?.forEach((item) => {
      if (props.isTreeV2) {
        item.treeRef?.setChecked(data[getNodeKey()], false);
      } else {
        item.treeRef?.setChecked(data[getNodeKey()], false, true);
      }
    });
  } else {
    if (props.isTreeV2) {
      treeItemRef.value.treeRef?.setChecked(data[getNodeKey()], false);
    } else {
      treeItemRef.value.treeRef?.setChecked(data[getNodeKey()], false, true);
    }
  }

  updateCheckedNodes(
    checkedDataList.value.filter(
      (item) => item[getNodeKey(true)] != data[getNodeKey(true)],
    ),
  );
  emit('onDeleteNode', data);
};

const getTotalCheckedNoes = () => {
  let checkedNodes = [];
  if (props.tabs) {
    treeItemRef.value?.forEach((item) => {
      if (props.filterParentNode) {
        const nodes = item.treeRef?.getCheckedNodes().filter((item1) => {
          return (item1[props.defaultProps.children]?.length ?? 0) <= 0;
        });
        checkedNodes = checkedNodes.concat(nodes);
      } else {
        checkedNodes = checkedNodes.concat(item.treeRef?.getCheckedNodes());
      }
    });
  } else {
    props.filterParentNode
      ? (checkedNodes = treeItemRef.value.treeRef
          ?.getCheckedNodes()
          .filter(
            (item) => (item[props.defaultProps.children]?.length ?? 0) <= 0,
          ))
      : (checkedNodes = treeItemRef.value.treeRef?.getCheckedNodes());
  }
  return checkedNodes;
};

const onTreeV2Check = (
  data: TreeNodeData,
  info: {
    checkedKeys: TreeKey[];
    checkedNodes: TreeData;
    halfCheckedKeys: TreeKey[];
    halfCheckedNodes: TreeData;
  },
) => {
  if (
    Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
    props.maxLength &&
    info.checkedNodes.length > props.maxLength
  ) {
    // 当前节点设置成不选中
    if (props.tabs) {
      treeItemRef.value?.forEach((item) => {
        item.treeRef?.setChecked(data[getNodeKey()], false);
        checkedDataList.value.forEach((item1) => {
          item.treeRef?.setChecked(item1[getNodeKey()], true);
        });
      });
    } else {
      treeItemRef.value.treeRef?.setChecked(data[getNodeKey()], false);

      // 遍历上次选中的节，所有节点都选中但是不递归选中子节点
      checkedDataList.value.forEach((item) => {
        treeItemRef.value.treeRef?.setChecked(item[getNodeKey()], true);
      });
    }
    ElMessage({
      type: 'error',
      message: `${props.namespace}最多可选择${props.maxLength}个`,
    });
    return;
  }
  watchModelValue = false;
  updateCheckedNodes(info.checkedNodes);
  nextTick(() => {
    watchModelValue = true;
  });
};

/**
 * 树节点check事件
 * @param data
 * @param evt
 */
const onCheck = (
  data: TreeNodeData,
  info: {
    checkedKeys: TreeKey[];
    checkedNodes: TreeData;
    halfCheckedKeys: TreeKey[];
    halfCheckedNodes: TreeData;
  },
) => {
  if (props.isTreeV2) {
    onTreeV2Check(data, info);
    return;
  }

  if (
    Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
    props.maxLength &&
    getTotalCheckedNoes().length > props.maxLength
  ) {
    // 当前节点设置成不选中
    if (props.tabs) {
      treeItemRef.value?.forEach((item) => {
        item.treeRef?.setChecked(data[getNodeKey()], false, true);
        checkedDataList.value.forEach((item1) => {
          item.treeRef?.setChecked(item1[getNodeKey()], true, false);
        });
      });
    } else {
      treeItemRef.value.treeRef?.setChecked(data[getNodeKey()], false, true);

      // 遍历上次选中的节，所有节点都选中但是不递归选中子节点
      checkedDataList.value.forEach((item) => {
        treeItemRef.value.treeRef?.setChecked(item[getNodeKey()], true, false);
      });
    }
    mapCheckedDataList();
    ElMessage({
      type: 'error',
      message: `${props.namespace}最多可选择${props.maxLength}个`,
    });
    return;
  }
  updateCheckedNodes();
};

/**
 * 全选逻辑
 * @param val
 */
const handleCheckAllChange = (val: boolean) => {
  isIndeterminate.value = false;
  if (val) {
    //全选节点
    if (
      Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
      props.maxLength &&
      props.treeTotal > props.maxLength
    ) {
      // 遍历上次选中的节，所有节点都选中但是不递归选中子节点
      checkedDataList.value.forEach((item) => {
        if (props.isTreeV2) {
          treeItemRef.value.treeRef?.setChecked(item[getNodeKey()], true);
        } else {
          treeItemRef.value.treeRef?.setChecked(
            item[getNodeKey()],
            true,
            false,
          );
        }
      });
      updateCheckedNodes();
      // updateTabStateMap();
      ElMessage({
        type: 'error',
        message: `${props.namespace}最多可选择${props.maxLength}个`,
      });

      return;
    }
    const enabledNodes = treeList.value.filter((item: any) => !item.disabled);
    if (props.isTreeV2) {
      const keys = enabledNodes.map((item: any) => item[getNodeKey()]);
      treeItemRef.value.treeRef?.setCheckedKeys(keys, false);
      nextTick(() => {
        checkedDataList.value = enabledNodes;
        updateCheckStatus();
      });
    } else {
      treeItemRef.value.treeRef?.setCheckedNodes(enabledNodes);
      mapCheckedDataList();
    }
    // updateTabStateMap();
  } else {
    // 置空
    clearSelected();
    // updateTabStateMap();
  }
};

/**
 * 清空选中
 */
const clearSelected = (updateModelValue: boolean = true) => {
  checkedDataList.value = [];
  if (props.tabs) {
    treeItemRef.value.forEach((item) => {
      item.treeRef?.setCheckedKeys([]);
    });
  } else {
    treeItemRef.value.treeRef?.setCheckedKeys([]);
  }
  updateCheckStatus(updateModelValue);
  emit('onClearEvent');
};

/**
 * 刷新选中的节点状态
 * @param checkedNodes 所有选中的节点数据
 */
const updateCheckedNodes = (
  checkedNodes: ITCheckListItem[] = getTotalCheckedNoes(),
) => {
  mapCheckedDataList(checkedNodes);
  updateCheckStatus(false);
};

/**
 * 处理全选按钮状态
 */
const updateCheckStatus = (updateModelValue: boolean = true) => {
  const count = checkedDataList.value.length;
  checkAll.value = count > 0 && count === props.treeTotal;
  isIndeterminate.value = count > 0 && count < props.treeTotal;
  if (updateModelValue) {
    emit('update:modelValue', checkedDataList.value);
  }
};

/**
 * 根据树选中----获取选中对象列表
 */
const mapCheckedDataList = (
  checkedNodes: ITCheckListItem[] = getTotalCheckedNoes(),
) => {
  checkedDataList.value = checkedNodes;
  emit('update:modelValue', checkedDataList.value);
};

/**
 * tree 结构转化成一维数组
 * @param menuOptions
 */
const convertTreeData = (menuOptions: any) => {
  for (let i = 0; i < menuOptions.length; i++) {
    if (menuOptions[i][props.defaultProps.children] != undefined) {
      const temp = menuOptions[i][props.defaultProps.children];
      delete menuOptions[i][props.defaultProps.children];
      menuOptions = menuOptions.concat(temp);
    }
  }
  return menuOptions;
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (!watchModelValue) return;
    if (newVal.length > 0) {
      for (const iterator of newVal) {
        if (
          checkedDataList.value.filter(
            (item) => item[getNodeKey()] == iterator[getNodeKey()],
          )?.length <= 0
        ) {
          checkedDataList.value.push(iterator);
        }
      }
    } else {
      clearSelected(false);
    }
  },
);

defineExpose({
  updateCheckedNodes,
});
</script>

<style lang="scss" scoped>
.te-immediate-transfer {
  height: 425px;
  width: 100%;
  display: flex;
  flex-direction: column;
  //选择区域
  > section:nth-child(1) {
    display: flex;
    flex: 1 1 auto;
    border-radius: 4px;
    border: 1px solid var(--te-border-color-light);
  }
  //页脚区域
  > section:nth-child(2) {
    height: 52px;
    min-height: 52px;
    line-height: 52px;
    text-align: right;
    flex: none;
  }

  &-left {
    height: 100%;
    width: v-bind(leftSectionWidth);

    .te-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;
      border: none;

      :deep(.te-tabs__content) {
        padding: 0;
        flex: 1;

        .te-tab-pane {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
      }
    }

    .common-transfer-list {
      flex: auto;
      height: 0;
      overflow-x: overlay;
      .te-tree {
        min-width: 100%;
        width: fit-content;
        :deep(.te-tree-node__content) {
          padding-right: var(--te-space-16);
        }
      }
    }

    &-no-tabs-container {
      height: 100%;
      display: flex;
      flex-direction: column;

      .left-tree-container {
        display: flex;
        flex-grow: 1;
      }
    }
  }

  //左侧未选择区域
  &-left,
  &-right {
    display: flex;
    flex-direction: column;
    .ct-content-left-tree-header {
      height: 40px;
      gap: 15px;
      padding: 4px 10px;
      flex: none;
      display: flex;
      align-items: center;
      justify-content: space-between;

      > span {
        font-weight: 600;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }

      :deep(.te-checkbox__label) {
        font-weight: 600;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }

      .ct-content-left-tree-header-dropdown {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        span {
          line-height: 22px;
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
    .ct-content-left-tree-header-highlight {
      background-color: var(--te-fill-color-light);
    }
  }
  //右侧已选择区域
  &-right {
    border-left: 1px solid var(--te-border-color-light);
    width: v-bind(rightWidth);
  }

  :deep(h5) {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--te-space-16);
    background-color: var(--te-fill-color-light);
    font-weight: 600;
    font-size: var(--te-font-size-b14);
    color: var(--te-text-color-regular);
    .te-checkbox {
      height: 40px;
    }
    .te-checkbox__label {
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-regular);
    }
  }

  .ct-content-left-tree-title {
    padding: var(--te-space-8) var(--te-space-16) 0 var(--te-space-16);
    box-sizing: border-box;
    font-weight: 600;
    color: var(--te-text-color-primary);
  }

  .ct-content-left-tree-search {
    height: 64px;
    flex: none;
    padding: var(--te-space-12) var(--te-space-16);
    box-sizing: border-box;
    .te-input__wrapper {
      box-shadow: 0 0 0 1px var(--te-input-border-color, var(--te-border-color)) !important;
    }
  }
  :deep(.vue-recycle-scroller__item-view) {
    &.hover {
      background-color: var(--te-fill-color-light);
    }
    .te-checkbox {
      padding: 0 16px;
      width: 100%;
    }

    .te-checkbox__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.te-tag__content) {
    display: flex;
    align-items: center;
  }
}
</style>
