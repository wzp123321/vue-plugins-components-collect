<template>
  <el-table :data="tableData" row-key="id" :tree-props="{ children: 'children' }" ref="tableRef">
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
    ],
  },
  { id: 4, name: 'Node 2', children: [{ id: 5, name: 'Node 2-1' }] },
  { id: 6, name: 'Node 3' },
]);

const tableRef = ref(null);

onMounted(() => {
  const el = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  const rows = el.querySelectorAll('tr.el-table__row');
  const flatData = flattenTree(cloneDeep(tableData.value));
  console.log(rows);
  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      rows.item(i).setAttribute('data-id', String(flatData[i].id));
      rows.item(i).setAttribute('data-parent-id', String(flatData[i].parentId));
    }
  }

  const sortable = Sortable.create(el, {
    animation: 150,
    handle: '.drag-handle',
    dataIdAttr: 'data-id',
    onMove: (evt) => {
      const { dragged, related } = evt;
      const draggedItem = dragged?.getAttribute('data-parent-id');
      const relatedItem = related?.getAttribute('data-parent-id');

      // 禁止跨层级拖拽
      if (draggedItem !== relatedItem) {
        return false; // 阻止拖拽
      }
      return true;
    },
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex === newIndex) return;

      const flatData = flattenTree(cloneDeep(tableData.value));
      const movedItem = flatData[oldIndex];
      const targetItem = flatData[newIndex];

      // 1️⃣ 禁止跨层级拖拽
      if (movedItem.parentId !== targetItem.parentId) {
        console.warn('禁止跨层级拖拽！');
        // sortable?.cancel()
        return;
      }

      // 2️⃣ 找到父级和兄弟节点
      const parent = findParent(tableData.value, movedItem.id);
      const siblings = parent ? parent.children : tableData.value;

      // 3️⃣ 找到 movedItem 和 targetItem 在 siblings 中的索引
      const movedIndex = siblings.findIndex((item) => item.id === movedItem.id);
      const targetIndex = siblings.findIndex((item) => item.id === targetItem.id);

      if (movedIndex === -1 || targetIndex === -1) {
        console.error('找不到对应节点！');
        return;
      }

      // 4️⃣ 移动元素
      const [removed] = siblings.splice(movedIndex, 1);
      siblings.splice(targetIndex, 0, removed);
    },
  });
});

// ✅ 修复：正确扁平化树形数据（包含 parentId）
const flattenTree = (tree, parentId = null, result = []) => {
  tree.forEach((node) => {
    result.push({ ...node, parentId });
    if (node.children?.length) {
      flattenTree(node.children, node.id, result);
    }
  });
  return result;
};

// ✅ 修复：正确查找父级
function findParent(tree, id, parent = null) {
  for (const node of tree) {
    if (node.id === id) return parent;
    if (node.children?.length) {
      const foundParent = findParent(node.children, id, node);
      if (foundParent) return foundParent;
    }
  }
  return null;
}
</script>

<style>
.drag-handle {
  cursor: move;
  color: #409eff;
}
</style>
