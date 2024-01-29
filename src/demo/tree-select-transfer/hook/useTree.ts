import { ref } from 'vue';

export const useTree = () => {
  // 树
  const treeRef = ref();
  // 选中节点
  const checkedKeys = ref<number[]>([]);
  // 过滤文本
  const filerTreeLabel = ref<string>('');
  // 展开节点
  const expandedKeys = ref<number[]>([]);
  // 初始化
  const initTreeChecked = (checked: number[], expanded: number[]) => {
    checkedKeys.value = [...checked];
    expandedKeys.value = [...checked];
  };
  // 节点选择
  const handleCheckChange = () => {};

  return {
    treeRef,
    filerTreeLabel,
    checkedKeys,
    expandedKeys,
    initTreeChecked,
    handleCheckChange,
  };
};
