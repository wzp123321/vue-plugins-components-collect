import { ref } from 'vue';
import type { AxiosInstance } from 'axios';
import alarmDeatilService, {
  TQueryAlarmHistoryListRes,
} from '../alarm-deatil.service';
import { ElMessage } from 'element-plus';

export const useHistorySelect = (axiosInstance: AxiosInstance) => {
  const selectedHistory = ref<any>(null);
  const historyList = ref<TQueryAlarmHistoryListRes>([]);
  const queryAlarmHistoryList = async (id: number) => {
    const res = await alarmDeatilService.queryAlarmHistoryList(axiosInstance, {
      id,
    });
    if (res.success) {
      historyList.value = res.data.map((item) => ({
        ...item,
        label: item.generationTime,
      }));
    } else {
      ElMessage.error(res.message);
    }
  };

  return { selectedHistory, historyList, queryAlarmHistoryList };
};
