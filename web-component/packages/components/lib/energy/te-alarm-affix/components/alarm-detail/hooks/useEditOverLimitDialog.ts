import { ref } from 'vue';
import type { AxiosInstance } from 'axios';
import alarmDetailService, { TUpdateCrosseDataParams } from '../alarm-deatil.service';
import { TeMessage } from '@tiansu/element-plus';

export const useEditOverLimitDialog = (axiosInstance: AxiosInstance) => {
  const editOverLimitDialogVisible = ref(false);
  const updateCrossDataParams = ref({} as TUpdateCrosseDataParams);
  const updateCrossDataLoading = ref(false);
  const openEditOverLimitDialog = (id: number, overrunValue: number, code?: string) => {
    updateCrossDataParams.value = { id, overrunValue, code };
    editOverLimitDialogVisible.value = true;
  };

  const updateCrossData = async () => {
    updateCrossDataLoading.value = true;
    const res = await alarmDetailService.updateCrossData(
      axiosInstance,
      updateCrossDataParams.value,
    );
    if (res.success) {
      editOverLimitDialogVisible.value = false;
    } else {
      TeMessage.error(res.message);
    }
    updateCrossDataLoading.value = false;
    return res;
  };
  const closeEditOverLimitDialog = () => {
    editOverLimitDialogVisible.value = false;
  };
  return {
    editOverLimitDialogVisible,
    updateCrossDataLoading,
    updateCrossDataParams,
    openEditOverLimitDialog,
    closeEditOverLimitDialog,
    updateCrossData,
  };
};
