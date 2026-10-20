import { addCommentQuery } from './alarm-detail.function';

export type TQueryAlarmHistoryListRes = Array<{
  id: number;
  content: string;
  generationTime: string;
  operationStatus: string;
  historyFlag: string;
  highPrecisionFlag: string;
  label?: string;
}>;

export type TUpdateCrosseDataParams = {
  id: number;
  overrunValue: number;
  code?: string;
};

const alarmDetailService = {
  // 分页查询告警
  async queryRecordDetail(
    axiosInstance: any,
    param: { id: number; typeId: string },
  ) {
    const res = await axiosInstance.post(
      '/energy/ims-api/alarm/queryRecordDetail',
      param,
    );
    return res?.data;
  },
  // 告警添加备注
  async addComment(axiosInstance: any, param: addCommentQuery) {
    const res = await axiosInstance.post(
      '/energy/ims-api/alarm/addComment',
      param,
    );
    return res?.data;
  },
  // 修改越限值
  async updateCrossData(
    axiosInstance: any,
    param: {
      id: number;
      overrunValue: number;
      code?: string;
    },
  ) {
    const res = await axiosInstance.post(
      '/energy/ims-api/alarm/updateCrossData',
      param,
    );
    return res?.data;
  },
  // 告警事件确认
  async queryAlarmHistoryList(axiosInstance: any, param: { id: number }) {
    const res = await axiosInstance.post(
      '/energy/ims-api/alarm/queryAlarmHistoryList',
      param,
    );
    return res?.data;
  },

  // 告警事件确认(未合并)
  async batchConfirmAlarm(axiosInstance: any, param: any) {
    const res = await axiosInstance.post(
      '/energy/ims-api/alarm/confirmAlarmAndComment',
      param,
    );
    return res?.data;
  },
};

export default alarmDetailService;
