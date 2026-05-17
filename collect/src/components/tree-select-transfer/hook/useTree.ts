import { ref } from 'vue';

export const useTree = () => {
  // 树
  const treeRef = ref();
  // 选中节点
  const treeCheckedKeys = ref<number[]>([]);
  // 过滤文本
  const filerTreeLabel = ref<string>('');
  // 展开节点
  const expandedKeys = ref<number[]>([]);
  // 初始化
  const initTreeChecked = (checked: number[], _expanded: number[]) => {
    treeCheckedKeys.value = [...checked];
    expandedKeys.value = [...checked];
  };
  // 节点选择
  const handleCheckChange = (checked: number[]) => {
    treeCheckedKeys.value = [...checked];
    treeRef.value && treeRef.value?.setCheckedKeys(treeCheckedKeys.value);
  };

  return {
    treeRef,
    filerTreeLabel,
    treeCheckedKeys,
    expandedKeys,
    initTreeChecked,
    handleCheckChange,
  };
};
