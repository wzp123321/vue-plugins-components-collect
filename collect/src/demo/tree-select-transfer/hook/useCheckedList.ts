import { ref } from 'vue';
import { Tst_ITreeNodeData } from '../tree-select-transfer.api';

export const useCheckedList = () => {
  // 选中列表
  const checkedList = ref<Tst_ITreeNodeData[]>([]);
  // 过滤文本
  const filerListLabel = ref<string>('');
  // 初始化
  const initCheckedList = (list: Tst_ITreeNodeData[]) => {
    checkedList.value = [...list];
  };
  /**
   * 单个移除
   * @param index
   */
  const removeCheckedItem = (index: number) => {
    checkedList.value.splice(index, 1);
  };
  /**
   * 清空
   */
  const clearChecked = () => {
    checkedList.value = [];
  };

  return {
    checkedList,
    filerListLabel,
    initCheckedList,
    removeCheckedItem,
    clearChecked,
  };
};
