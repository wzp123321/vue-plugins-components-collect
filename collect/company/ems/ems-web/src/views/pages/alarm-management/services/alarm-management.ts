import url from '@/api/api-url';
import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';
const alarmService = {
  /**
   * 查询告警列表
   * @param params
   * @returns
   */
  async queryAlarmList(params: any) {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const reqUrl = '/alarm/queryAlarmList';
    const res = await postRequest(reqUrl, p);
    return res;
  },
  /**
   * 操作单个告警
   * @param params
   * @returns
   */
  async operationAlarm(params: any) {
    const reqUrl = '/alarm/operateAlarm';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 操作单个告警
   * @param params
   * @returns
   */
  async operationAlarmBotch(params: any) {
    const reqUrl = '/alarm/operateAlarmBatch';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 查询告警详细信息
   * @param params
   * @returns
   */
  async queryAlarmDetails(params: any) {
    const reqUrl = '/alarm/queryAlarmLogList';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 查询告警跳转信息
   * @param params
   * @returns
   */
  async queryJumpDetails(params: { alarmId: number; alarmTypeId: number; treeId: number }) {
    const reqUrl = '/alarm/queryAlarmAbnormalDetail';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 查询告警类型
   * @param params
   * @returns
   */
  async queryAlarmType() {
    const reqUrl = '/alarm/queryAlarmTypeListWithBoundary';
    const res = await postRequest(reqUrl);
    return res;
  },
};
export default alarmService;
