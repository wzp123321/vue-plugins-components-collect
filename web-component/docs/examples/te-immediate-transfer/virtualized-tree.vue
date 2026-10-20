<template>
  <te-immediate-transfer
    ref="transferRef"
    v-model:modelValue="checkedValue"
    :defaultProps="props"
    :choosedProps="props"
    :treeTotal="treeNumber"
    :maxLength="maxLength"
    :showChooseAll="true"
    :data="dataList"
    leftSectionWidth="70%"
    :strictlyProp="false"
    :show-checkbox="false"
    :check-on-click-node="false"
    filterParentNode
    :isTreeV2="true"
    :height="300"
    :expanedKeys="defaultExpandedKeys"
  >
    <template #leftLevelTree>
      <div
        style="
          display: flex;
          flex: 1 1 0;
          border-left: 1px solid var(--te-border-color-divider);
          overflow: hidden;
        "
      >
        <te-immediate-transfer-tree-item
          ref="treeItemRef"
          treeTitle="二级标题"
          :show-checkbox="true"
          :check-on-click-node="true"
          nodeKey="id"
          :props="props"
          :data="dataList"
          :isTreeV2="true"
          :height="300"
          :defaultCheckedKeys="checkedValue?.map((item) => item[props.id])"
          @check="updateCheckedNodes"
        >
        </te-immediate-transfer-tree-item>
      </div>
    </template>
  </te-immediate-transfer>
</template>

<script setup lang="ts">
import {
  TreeKey,
  TreeData,
  TreeNodeData,
} from '@tiansu/element-plus/es/components/tree-v2/src/types';
import {
  TeImmediateTransfer,
  TeImmediateTransferTreeItem,
} from '@ts-web-package/components/lib/te-immediate-transfer';
import { onMounted, ref } from 'vue';

const checkedValue = ref();
const treeNumber = ref(89);
const maxLength = ref(30);
const transferRef = ref();
const treeItemRef = ref();
const defaultExpandedKeys = ref(['node-2']);

const props = {
  value: 'relationId',
  label: 'name',
  children: 'children',
};

interface Tree {
  relationId: string;
  name: string;
  children?: Tree[];
}

const updateCheckedNodes = (
  data: TreeNodeData,
  info: {
    checkedKeys: TreeKey[];
    checkedNodes: TreeData;
    halfCheckedKeys: TreeKey[];
    halfCheckedNodes: TreeData;
  },
) => {
  transferRef.value.updateCheckedNodes(info.checkedNodes);
};

const onDeleteNodeEvent = (item) => {
  // treeItemRef.value?.treeRef?.setChecked(item[defaultProps().id], false, true);
  // updateCheckedNodes();
};

const onClearEvent = () => {
  treeItemRef.value?.treeRef?.setCheckedKeys([]);
};

const getKey = (prefix: string, id: number) => {
  return `${prefix}-${id}`;
};

const createData = (
  maxDeep: number,
  maxChildren: number,
  minNodesNumber: number,
  deep = 1,
  key = 'node',
): Tree[] => {
  let id = 0;
  return Array.from({ length: minNodesNumber })
    .fill(deep)
    .map(() => {
      const childrenNumber =
        deep === maxDeep ? 0 : Math.round(Math.random() * maxChildren);
      const nodeKey = getKey(key, ++id);
      return {
        relationId: nodeKey,
        name: nodeKey,
        children: childrenNumber
          ? createData(maxDeep, maxChildren, childrenNumber, deep + 1, nodeKey)
          : undefined,
      };
    });
};

// 树节点列表
const dataList = ref(createData(4, 30, 40));

const tabs = [
  {
    title: '标签1',
    data: createData(4, 30, 40),
  },
  {
    title: '标签2',
    data: createData(2, 10, 10),
  },
  {
    title: '标签3',
    data: createData(3, 30, 30),
  },
];

onMounted(() => {
  // setTimeout(() => {
  //   checkedValue.value = [
  //     {
  //       name: 'node-3',
  //       relationId: 'node-3',
  //     },
  //   ];
  // }, 2000);
});
</script>
