import { ref } from 'vue';

export function useTree<T extends { id: number; children?: T[] }[]>() {
  const treeRef = ref<any>();
  const checkedKeys = ref<number[]>([]);
  const filterText = ref<string>('');
  const expandedKeys = ref<number[]>([]);

  const initTreeChecked = (checked: number[], expanded: number[] = []) => {
    checkedKeys.value = [...checked];
    expandedKeys.value = expanded.length > 0 ? [...expanded] : [...checked];
  };

  const handleCheckChange = (checked: number[]) => {
    checkedKeys.value = [...checked];
    treeRef.value?.setCheckedKeys(checkedKeys.value);
  };

  const setExpandedKeys = (keys: number[]) => {
    expandedKeys.value = [...keys];
  };

  return {
    treeRef,
    filterText,
    checkedKeys,
    expandedKeys,
    initTreeChecked,
    handleCheckChange,
    setExpandedKeys,
  };
}
