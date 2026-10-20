<template>
  <te-immediate-transfer
    ref="transferRef"
    v-model:modelValue="checkedValue"
    :defaultProps="{
      id: 'id',
      children: 'children',
      label: 'name',
      parentTitle: 'parentTitle',
    }"
    :treeTotal="treeNumber"
    :maxLength="maxLength"
    treeTitle="一级标题"
    :showChooseAll="false"
    :show-checkbox="false"
    :check-on-click-node="false"
    :data="dataList"
    :showLeftCount="false"
    nodeKey="id"
    leftSectionWidth="70%"
    :strictlyProp="false"
    :showLeftTreeSearch="false"
    :showRightTreeSearch="false"
    filterParentNode
    @onLeftNodeClick="
      (data, node) => {
        console.log('当前选中node：', data);
      }
    "
    @onDeleteNode="onDeleteNodeEvent"
    @onClearEvent="onClearEvent"
    show-parent-title
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
          :props="defaultProps()"
          :data="dataList"
          :defaultCheckedKeys="
            checkedValue?.map((item) => item[defaultProps().id])
          "
          @check="updateCheckedNodes"
        >
        </te-immediate-transfer-tree-item>
      </div>
    </template>
  </te-immediate-transfer>
</template>

<script setup lang="ts">
import {
  TeImmediateTransfer,
  TeImmediateTransferTreeItem,
} from '@ts-web-package/components/lib/te-immediate-transfer';
import { onMounted, ref } from 'vue';
import type Node from '@tiansu/element-plus/es/components/tree/src/model/node';

interface Tree {
  name: string;
  isLeaf?: boolean;
  id: number;
}

const checkedValue = ref([]);
const treeNumber = ref(89);
const maxLength = ref(3);
const transferRef = ref();
const treeItemRef = ref();

const updateCheckedNodes = () => {
  transferRef.value.updateCheckedNodes(
    treeItemRef.value?.treeRef?.getCheckedNodes(),
  );
};

const onDeleteNodeEvent = (item) => {
  // treeItemRef.value?.treeRef?.setChecked(item[defaultProps().id], false, true);
  // updateCheckedNodes();
};

const onClearEvent = () => {
  treeItemRef.value?.treeRef?.setCheckedKeys([]);
};

// 树节点列表
const dataList = ref([
  {
    id: 1815520555212813,
    name: '某地区的三甲医院__区域模型总节点',
    parentTitle: '上级标题',
    children: [
      {
        id: 1815520555212820,
        name: '某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点',
        parentTitle: '上级标题上级标题上级标题',
      },
      {
        id: 1815520555212821,
        name: '444',
        parentTitle: '上级标题上级标题上级标题',
      },
    ],
  },
  {
    id: 1815520555212814,
    name: '某地区的三甲医院__区域模型总节点222',
    parentTitle: '上级标题上级标题上级标题上级标题上级标题',
  },
]);

const tabs = [
  {
    title: '标签1',
    data: [
      {
        id: 1815520555212813,
        name: '某地区的三甲医院__区域模型总节点',
        children: [
          {
            id: 1815520555212820,
            name: '某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点某地区的三甲医院__区域模型总节点',
          },
          {
            id: 1815520555212821,
            name: '444',
          },
        ],
      },
      {
        id: 1815520555212814,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
  {
    title: '标签2',
    data: [
      {
        id: 1815520555212815,
        name: '某地区的三甲医院__区域模型总节点',
      },
      {
        id: 1815520555212816,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
  {
    title: '标签3',
    data: [
      {
        id: 1815520555212817,
        name: '某地区的三甲医院__区域模型总节点',
      },
      {
        id: 1815520555212818,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
];

const defaultProps = (
  children: string = 'children',
  label: string = 'name',
  disabledKey: string = 'lockFlag',
  disabledValue: any = true,
) => {
  return {
    children,
    label,
    disabled: (data: {}, tree: {}) => {
      return data[disabledKey] === disabledValue;
    },
    id: 'id',
    parentTitle: 'parentTitle',
  };
};

const loadNode = (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    return resolve([
      { name: '某地区的三甲医院__区域模型总节点', id: 1815520555216907 },
    ]);
  }
  if (node.level > 1) return resolve([]);

  setTimeout(() => {
    const data: Tree[] = [
      {
        name: 'leaf',
        isLeaf: true,
        id: 1815520555216908,
      },
      {
        name: '区域院区1-50.58',
        id: 1815520555216909,
      },
    ];

    resolve(data);
  }, 500);
};

onMounted(() => {
  //   setTimeout(() => {
  //     checkedValue.value = [{
  //     name: "区域院区1-50.58",
  //     id: 1815520555212814,
  // }]
  //   }, 2000);
});
</script>
