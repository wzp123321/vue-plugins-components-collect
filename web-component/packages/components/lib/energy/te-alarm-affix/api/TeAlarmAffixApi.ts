/**
 * 告警模块 API 入口(axiosInstance 入参)
 */
import type { AxiosInstance } from 'axios';
import {
  BatchConfirmAlarmBody,
  IResTemplate,
  type AlarmEventCountVO,
  type AlarmNoticeConfigVO,
  type AlarmNotifyItem,
  type AlarmPageQuery,
  type EventPageQuery,
  type IAlarmLinkList,
  type PageResponse,
} from './index.api';

const API_BASE_URL = '/energy/ims-api';

export class TeAlarmAffixApi {
  /**
   * 查询当前用户的告警通知配置:POST /alarm/queryAlarmInfoConfig
   * @param axiosInstance 、
   * @returns
   */
  public static queryAlarmInfoConfig(
    axiosInstance: AxiosInstance,
  ): Promise<IResTemplate<AlarmNoticeConfigVO | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/queryAlarmInfoConfig`, {})
      .then((res) => {
        console.log('[queryAlarmInfoConfig] res:', res);
        return res.data;
      });
  }

  /**
   * 保存当前用户的告警通知配置:POST /alarm/saveAlarmInfoConfig
   */
  public static saveAlarmInfoConfig(
    axiosInstance: AxiosInstance,
    body: AlarmNoticeConfigVO,
  ): Promise<IResTemplate<null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/saveAlarmInfoConfig`, body)
      .then((res) => res.data);
  }

  /**
   * 告警分页:POST /alarm/queryRealTimeAlarmPage(返回 total 即告警 tab 角标)
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static queryRealTimeAlarmPage(
    axiosInstance: AxiosInstance,
    body: AlarmPageQuery,
  ): Promise<IResTemplate<PageResponse | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/queryRealTimeAlarmPage`, body)
      .then((res) => res.data);
  }

  /**
   * 事件分页:POST /alarm/queryRealTimeEventPage(返回 total 即事件 tab 角标)
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static queryRealTimeEventPage(
    axiosInstance: AxiosInstance,
    body: EventPageQuery,
  ): Promise<IResTemplate<PageResponse | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/queryRealTimeEventPage`, body)
      .then((res) => res.data);
  }

  /**
   * 24h 窗口内告警+事件未确认合并计数(分别返回告警/事件数,前端自己求和):
   * - 用途:tab 角标(alarmTotal / eventTotal)+ 悬浮框 badge(badgeTotal)
   * - body.startTime/endTime 由调用方用 utils/time.getTimeWindow 生成
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static queryCurrentAlarmAndEventCount(
    axiosInstance: AxiosInstance,
    body: {
      startTime: string;
      endTime: string;
      spaceCodeList: string[];
    },
  ): Promise<IResTemplate<AlarmEventCountVO | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/queryCurrentAlarmAndEventCount`, body)
      .then((res) => res.data);
  }

  /**
   * 5s 轮询新进告警/事件 list(混合告警+事件,按 item.alarmEventType 区分)
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static queryRealTimeAlarm(
    axiosInstance: AxiosInstance,
    body: {
      startTime: string;
      endTime: string;
      spaceCodeList: string[];
    },
  ): Promise<IResTemplate<AlarmNotifyItem[] | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/queryRealTimeAlarm`, body)
      .then((res) => res.data);
  }

  /**
   * 单条 + 批量确认统一入口:POST /alarm/confirmAlarmAndComment
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static batchConfirmAlarm(
    axiosInstance: AxiosInstance,
    body: BatchConfirmAlarmBody,
  ): Promise<IResTemplate<unknown>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/confirmAlarmAndComment`, body)
      .then((res) => res.data);
  }

  /**
   * 组态图链接:POST /alarm/getDrawMapListByAlarm
   * @param axiosInstance
   * @param body
   * @returns
   */
  public static drawMapList(
    axiosInstance: AxiosInstance,
    body: { objectId: number; objectType: string; deviceId: number },
  ): Promise<IResTemplate<IAlarmLinkList[] | null>> {
    return axiosInstance
      .post(`${API_BASE_URL}/alarm/getDrawMapListByAlarm`, body)
      .then((res) => res.data);
  }
}

export default TeAlarmAffixApi;
