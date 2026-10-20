import { ref, computed, Ref } from "vue";

export interface RowData {
  [key: string]: any;
}

/**
 * @description 表格多选数据操作
 * @param {String} rowKey 当表格可以多选时，所指定的 id 字段名
 * @returns {Object} 多选数据操作相关的属性和方法
 */
export const useSelection = (
  rowKey = "id"
): {
  isSelected: Ref<boolean>;
  selectedList: Ref<RowData[]>;
  selectedListIds: Ref<string[]>;
  selectionChange: (rowArr: RowData[]) => void;
} => {
  const isSelected = ref(false); // 是否存在选中项
  const selectedList = ref<RowData[]>([]); // 选中的数据列表

  // 计算属性：当前选中的所有 ids 数组
  const selectedListIds = computed(() => {
    return selectedList.value.map((item) => item[rowKey]);
  });

  /**
   * @description 多选操作
   * @param {Array} rowArr 当前选择的所有数据
   * @return void
   */
  const selectionChange = (rowArr: RowData[]) => {
    isSelected.value = rowArr.length > 0;
    selectedList.value = rowArr;
  };

  return {
    isSelected,
    selectedList,
    selectedListIds,
    selectionChange,
  };
};
