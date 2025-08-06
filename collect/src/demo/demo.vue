<template>
  {{ tableData }}
  <el-table
    :data="tableData"
    row-key="id"
    :default-expand-all="true"
    :tree-props="{ children: 'children' }"
    ref="tableRef"
  >
    <!-- 列定义 -->
    <el-table-column prop="name" label="Name" />
    <el-table-column label="操作">
      <template #default="scope">
        <span class="drag-handle">拖拽</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { cloneDeep } from 'lodash';
import Sortable from 'sortablejs';

const tableData = ref([
  {
    id: 1,
    name: 'Node 1',
    children: [
      { id: 2, name: 'Node 1-1' },
      { id: 3, name: 'Node 1-2' },
      { id: 7, name: 'Node 1-4' },
    ],
  },
  { id: 4, name: 'Node 2', children: [{ id: 5, name: 'Node 2-1' }] },
  { id: 6, name: 'Node 3' },
]);

const tableRef = ref(null);

onMounted(() => {
  const el = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  Sortable.create(el, {
    animation: 150,
    handle: '.drag-handle', // 拖拽手柄
    onEnd: (evt) => {
      // 这里的old和new是两个元素在扁平化数组中的位置
      const { oldIndex, newIndex } = evt;
      if (oldIndex === newIndex) {
        return;
      }
      // 获取扁平化数据（包含父子关系）
      const cloneData = tableData.value;
      const flatData = flattenTree(cloneData);
      console.log(flatData, oldIndex, newIndex);
      const movedItem = flatData[oldIndex];
      const targetItem = flatData[newIndex];
      console.log(movedItem, targetItem, movedItem.parentId !== targetItem.parentId);
      // 确保只能在同级拖拽
      if (movedItem.parentId !== targetItem.parentId) {
        return;
      }

      const parent = findParent(cloneData, movedItem.id);
      const children = parent ? parent.children : cloneData;
      console.log('children', children);
      const flatNewIndex = children?.findIndex((item) => item.id === targetItem.id);
      const flatOldIndex = children?.findIndex((item) => item.id === movedItem.id);
      console.log(flatNewIndex, flatOldIndex);
      if (flatNewIndex > flatOldIndex) {
        children.splice(flatNewIndex + 1, 0, movedItem);
        children.splice(flatOldIndex, 1);
      } else if (flatNewIndex < flatOldIndex) {
        children.splice(flatNewIndex, 0, movedItem);
        children.splice(flatOldIndex + 1, 1);
      }
    },
  });
});

// 树形数据扁平化（带 parentId）
const flattenTree = (tree, parentId = null) => {
  const cloneData = cloneDeep(tree);
  let result = [];
  cloneData.forEach((node) => {
    result.push({ ...node, parentId });
    if (node.children) flattenTree(node.children, node.id);
  });
  return result;
};

// 查找父节点
function findParent(tree, id, parent = null) {
  for (const node of tree) {
    if (node.id === id) return parent;
    if (node.children) {
      const found = findParent(node.children, id, node);
      if (found) return found;
    }
  }
  return null;
}
</script>
