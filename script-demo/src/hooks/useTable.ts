import { CommonReturnList } from '@/apis/types';
import { TeModuleTable } from '@tiansu/ts-web-package';
import { cloneDeep } from 'lodash-es';
import { ref } from 'vue';

export const useTable = <T extends unknown, Q extends object>(
  defaultQueryParams: Q,
) => {
  const totalAll = ref(0);
  const queryParams = ref<Q>(cloneDeep(defaultQueryParams));
  const tableRef = ref<InstanceType<typeof TeModuleTable>>();
  const selectRowList = ref<Array<T>>();
  const tableColumnData = ref<any[]>([]);
  const requestColumnCallBack = (backData: any) => {
    // useTableColumn hook 的逻辑：
    // 如果 res.data.columns 存在，则 dataCallBack 接收的是列数组
    // 否则，dataCallBack 接收整个响应对象，需要返回 { columns, pageSize }
    if (Array.isArray(backData)) {
      // 如果接收到的是列数组（说明 res.data.columns 存在）
      tableColumnData.value = backData;
      return backData;
    }
    // 如果接收到的是响应对象（说明 res.data.columns 不存在）
    const columns = backData?.data?.columns || backData?.data || [];
    tableColumnData.value = columns;
    return {
      columns,
      pageSize: backData?.data?.pageSize || 10,
    };
  };
  const handleSelectionChanged = (val: Array<T>) => {
    selectRowList.value = val;
  };
  const requestDataCallBack = (row: { data: CommonReturnList<T> }) => {
    const { list: rows, total } = row.data;
    totalAll.value = total;
    return {
      rows,
      total,
    };
  };
  const query = () => {
    tableRef.value.query();
    tableRef.value.clearSelection();
  };
  const queryAll = () => {
    query();
  };
  const reset = () => {
    tableRef.value.clearSelection();
    tableRef.value.reset();
  };

  // 刷新方法
  const refresh = () => {
    tableRef.value.getTableList();
  };
  return {
    totalAll,
    tableColumnData,
    requestColumnCallBack,
    handleSelectionChanged,
    requestDataCallBack,
    selectRowList,
    queryParams,
    tableRef,
    queryAll,
    refresh,
    reset,
    query,
  };
};
