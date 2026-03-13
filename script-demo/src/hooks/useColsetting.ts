import { CommonTableColType } from '@/apis/common/index.api';
import { ref } from 'vue';

export const useColsetting = () => {
  const tableColumnData = ref<Array<CommonTableColType>>([]);
  // 列相应回调
  const requestColumnCallBack = (backData: Array<CommonTableColType>) => {
    tableColumnData.value = backData;
    return backData;
  };
  return {
    tableColumnData,
    requestColumnCallBack,
  };
};
