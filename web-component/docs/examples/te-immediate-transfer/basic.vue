<template>
  <te-immediate-transfer
    v-model:modelValue="checkedValue"
    :defaultProps="defaultProps()"
    :treeTotal="treeNumber"
    :showChooseAll="true"
    :tabs="tabs"
    nodeKey="relationId"
    leftSectionWidth="70%"
    :strictlyProp="false"
    filterParentNode
  ></te-immediate-transfer>
</template>

<script setup lang="ts">
import { TeImmediateTransfer } from '@ts-web-package/components/lib/te-immediate-transfer';
import { onMounted, ref } from 'vue';
import type Node from 'element-plus/es/components/tree/src/model/node';

const checkedValue = ref();
const treeNumber = ref(89);
const maxLength = ref(3);

// 树节点列表
const dataList = ref([
  {
    relationId: 1815520555212813,
    name: '某地区的三甲医院__区域模型总节点',
  },
  {
    relationId: 1815520555212814,
    name: '某地区的三甲医院__区域模型总节点222',
  },
]);

const tabs = [
  {
    title: '标签1',
    data: [
      {
        relationId: 1815520555212813,
        name: '某地区的三甲医院__区域模型总节点',
        children: [
          {
            relationId: 1815520555212820,
            name: '333',
          },
          {
            relationId: 1815520555212821,
            name: '444',
          },
        ],
      },
      {
        relationId: 1815520555212814,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
  {
    title: '标签2',
    data: [
      {
        relationId: 1815520555212815,
        name: '某地区的三甲医院__区域模型总节点',
      },
      {
        relationId: 1815520555212816,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
  {
    title: '标签3',
    data: [
      {
        relationId: 1815520555212817,
        name: '某地区的三甲医院__区域模型总节点',
      },
      {
        relationId: 1815520555212818,
        name: '某地区的三甲医院__区域模型总节点222',
      },
    ],
  },
];

interface Tree {
  name: string;
  isLeaf?: boolean;
  id: number;
}

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
    id: 'relationId',
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
  setTimeout(() => {
    checkedValue.value = [
      {
        name: '区域院区1-50.58',
        relationId: 1815520555212814,
      },
    ];
  }, 2000);
});
</script>
