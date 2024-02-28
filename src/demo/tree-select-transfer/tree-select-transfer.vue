<template>
  <div class="tree-select-transfer">
    <div class="tst-box is-left">
      <div class="tst-box-header">
        <el-checkbox>待选({{ mapDataTotal() }})</el-checkbox>
        <!-- 插槽 -->
        <slot name="headerRight"></slot>
      </div>
      <div class="tst-box-body">
        <!-- 搜索框 -->
        <div class="tst-box-body-filter">
          <el-input v-model="filerTreeLabel" placeholder="请输入" />
        </div>
        <el-tree
          ref="treeRef"
          :data="treeList"
          :props="props.defaultProps"
          :highlight-current="true"
          :node-key="props.nodeKey"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="treeCheckedKeys"
          show-checkbox
          @check="handleTreeCheck"
        />
      </div>
    </div>
    <div class="tst-box is-right">
      <div class="tst-box-header">
        <span>已选({{ checkedList.length }})</span>
      </div>
      <div class="tst-box-body">
        <!-- 搜索框 -->
        <div class="tst-box-body-filter">
          <el-input v-model="filerListLabel" placeholder="请输入" />
        </div>
        <!-- 列表 -->
        <ul class="tst-right-list" v-if="checkedList.length > 0">
          <li v-for="(item, index) in checkedList" :key="item[mapItemKey()]">
            <span class="tst-right-list-name">{{ mapItemLabel(item) }}</span>
            <span class="tst-right-list-close" @click="handleDelete(index)">x</span>
          </li>
        </ul>
        <div class="tst-right-empty" v-else>
          <span>暂无数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, nextTick, onMounted } from 'vue';
import { ElCheckbox } from 'element-plus';
// 类型
import { Tst_IDefaultProps, Tst_ITreeCheckEvent, Tst_ITreeNodeData } from './tree-select-transfer.api';
// hook
import { useTree, useCheckedList } from './hook/index';
import { mapArrayFlat } from './utils/';
// 常量
import { treeList, defaultExpandedKeys } from './constant';
import { message } from 'ant-design-vue';
// props
const props = defineProps({
  modelValue: {
    type: Array as PropType<number[]>,
    default: [],
  },
  expandedKeys: {
    type: Array as PropType<number[]>,
    default: [],
  },
  data: {
    type: Array as PropType<Tst_ITreeNodeData[]>,
    default: [],
  },
  defaultProps: {
    type: Object as PropType<Tst_IDefaultProps>,
    default: {
      label: 'treeName',
      children: 'childTree',
    },
  },
  nodeKey: {
    type: String,
    default: 'id',
  },
  limit: {
    type: Number,
    default: 100,
  },
});
// 总数
const mapDataTotal = () => {
  return 100;
};

// 树
const { treeRef, filerTreeLabel, treeCheckedKeys, expandedKeys, initTreeChecked, handleCheckChange } = useTree();
/**
 * 树选中
 */
const handleTreeCheck = (data: Tst_ITreeNodeData, event: Tst_ITreeCheckEvent<Tst_ITreeNodeData>) => {
  const { checkedKeys, checkedNodes } = event;
  if (props.limit && checkedKeys?.length > props.limit) {
    message.error(`最多选择${props.limit}个`);
    treeRef.value && treeRef.value?.setCheckedKeys(treeCheckedKeys.value);
    return;
  }
  handleCheckChange(event.checkedKeys);
  initCheckedList(checkedNodes);
};
// 列表
const { checkedList, filerListLabel, initCheckedList, removeCheckedItem, clearChecked } = useCheckedList();
/**
 * 单个删除
 * @param index
 */
const handleDelete = (index: number) => {
  treeCheckedKeys.value.splice(index, 1);
  treeRef.value && treeRef.value?.setCheckedKeys([]);
  treeCheckedKeys.value.forEach((item) => {
    treeRef.value && treeRef.value?.setChecked(item, true, false);
  });
  handleCheckChange(treeCheckedKeys.value);
  removeCheckedItem(index);
};
// 列表key
const mapItemKey = () => {
  return props.nodeKey || 'id';
};
// 列表文本
const mapItemLabel = (item: Tst_ITreeNodeData) => {
  const key = props.defaultProps.label;
  return item[key];
};

/**
 * 初始化
 */
onMounted(() => {
  initTreeChecked(props.modelValue, props.expandedKeys);
  expandedKeys.value = [...defaultExpandedKeys];

  const checkedList = treeRef.value ? treeRef.value?.getCheckedNodes() : [];
  initCheckedList(checkedList);

  mapArrayFlat();
});
</script>

<style lang="less" scoped>
.tree-select-transfer {
  display: flex;
  width: 100%;
  height: 100%;
  box-shadow: 0px 0px 0px 2px var(--color-text-divider);

  > .tst-box {
    width: 0;
    flex: 1 1 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .tst-box-header {
      height: 48px;
      line-height: 48px;
      display: flex;
      align-items: center;
      padding: 8px 16px;
      display: flex;
      border-bottom: 1px solid #eee;
    }

    > .tst-box-body {
      flex: auto;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      .tst-box-body-filter {
        padding: 10px;
      }
    }

    &.is-left {
      border-right: 1px solid #eee;
    }

    &.is-right {
      .tst-right-list {
        flex: auto;

        li {
          cursor: pointer;
          padding: 6px 16px;
          display: flex;
          align-items: center;

          .tst-right-list-name {
            flex: auto;
          }

          .tst-right-list-close {
            display: none;
            padding: 0 6px;
          }
        }

        li:hover {
          background-color: rgba(0, 0, 0, 0.05);

          .tst-right-list-close {
            display: inline-block;
          }
        }
      }
      .tst-right-empty {
        flex: auto;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
