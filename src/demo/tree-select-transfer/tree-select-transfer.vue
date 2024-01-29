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
          :props="props.defaultProps"
          :node-key="props.nodeKey"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          show-checkbox
          @check-change="handleCheckChange"
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
          <li v-for="item in checkedList" :key="item[mapItemKey()]">
            <span>{{ mapItemLabel(item) }}</span>
            <span>x</span>
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
import { PropType, onMounted } from 'vue';
import { ElCheckbox } from 'element-plus';
// 类型
import { Tst_IDefaultProps, Tst_ITreeNodeData } from './tree-select-transfer.api';
// hook
import { useTree, useCheckedList } from './hook/index';
import { mapArrayFlat } from './utils/';
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
  },
  nodeKey: {
    type: String,
  },
});
// 总数
const mapDataTotal = () => {
  return 100;
};

// 树
const { treeRef, filerTreeLabel, checkedKeys, expandedKeys, initTreeChecked, handleCheckChange } = useTree();
// 列表
const { checkedList, filerListLabel, initCheckedList, removeCheckedItem, clearChecked } = useCheckedList();
// 列表key
const mapItemKey = () => {
  return props.nodeKey || 'id';
};
// 列表文本
const mapItemLabel = (item: Tst_ITreeNodeData) => {
  const key = mapItemKey();
  return item[key];
};
/**
 * 初始化
 */
onMounted(() => {
  initTreeChecked(props.modelValue, props.expandedKeys);

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
    flex: 1 0 auto;
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
