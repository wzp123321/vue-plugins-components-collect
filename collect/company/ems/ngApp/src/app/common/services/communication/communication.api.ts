const BASE_PATH_API: string = '/energy-ems';
const ASSESS_TOKEN_BASE_PATH: string = '/gateway/v1';

export const URL_PATH = {
  Alarm: {
    GetTodayAlarmCount: `${BASE_PATH_API}/app/alarm/getTodayAlarmCount`, // 获取今日告警数量
  },
  EnergyManager: {
    FinishDailyWork: `${BASE_PATH_API}/app/energyAssistant/finishDailyWork`, // 任务反馈接口
    GetTodayWork: `${BASE_PATH_API}/app/energyAssistant/getTodayWork`, // 查询日常工作接口
    GetCalendarWork: `${BASE_PATH_API}/app/energyAssistant/getCalendarWork`, // 获取日历模式接口
    AddMeasure: `${BASE_PATH_API}/app/energyAssistant/addMeasure`, // 新增措施接口
    todoQuantity: `${BASE_PATH_API}/app/energyAssistant/todoQuantity`, // 获取待办数量接口
    GetWeeklyReportList: `${BASE_PATH_API}/app/energyAssistant/getWeeklyReportList`, // 获取一周小结列表
    UploadImages: `${window.location.protocol}//${window.location.host}${BASE_PATH_API}/api/EnergyManager/UploadImages`, // 照片上传接口
    GetServiceDays: `${BASE_PATH_API}/app/energyAssistant/getServiceDays`, // 获取服务天数
    GetRootName: `${BASE_PATH_API}/app/energyAssistant/getRootName`, // 获取区域根节点名称
  },
  EnergyEvent: {
    isHaveData: `${BASE_PATH_API}/energyEvent/isHaveData`, // 判断指定查询年是否有数据
    getEventTypeInfoList: `${BASE_PATH_API}/app/energyEvent/getEventTypeInfoList`, // 能源事件类型下拉列表
    getEnergyCodeList: `${BASE_PATH_API}/app/energyEvent/getEnergyCodeList`, // 分类分项列表
    getDropdownAntTreeList: `${BASE_PATH_API}/app/energyEvent/getDropdownAntTreeList`, // 下拉树
    getDropdownDeviceList: `${BASE_PATH_API}/app/energyEvent/getDownDeviceList`, // 设备列表
    saveEventForm: `${BASE_PATH_API}/app/energyEvent/saveEventForm`, // 新增(修改)能源事件
    deleteEventByKey: `${BASE_PATH_API}/energyEvent/deleteEventByKey`, // 删除能源事件
    getEnergyEventEntity: `${BASE_PATH_API}/energyEvent/getEnergyEventEntity`, // 获取能源事件对象
    getTimeAxisEventInfoList: `${BASE_PATH_API}/energyEvent/getTimeAxisEventInfoList`, // 时间轴chart
    getWholeEventInfoList: `${BASE_PATH_API}/energyEvent/getWholeEventInfoList`, // 全量列表卡片
    getEnergyEventPageList: `${BASE_PATH_API}/energyEvent/getEnergyEventPageList`, // 分页列表
    getDetailsByKey: `${BASE_PATH_API}/energyEvent/getDetailsByKey`, // 事件详情
    getUploadImages: `${window.location.protocol}//${window.location.host}${BASE_PATH_API}/app/energyEvent/uploadImages`, // 照片上传接口
  },
  AssessToekn: {
    share: `${ASSESS_TOKEN_BASE_PATH}/auth/share`, // 鉴权
    authorize: `${ASSESS_TOKEN_BASE_PATH}auth/authorize`, // 鉴权
  },
  Common: {
    getSystemDate: `${BASE_PATH_API}/common/system/time`, // 获取服务器时间
  },
};
export interface ICommonResponse<T> {
  readonly errcode: number;
  readonly errmsg: string; // 错误信息
  readonly data?: T;
  readonly success: boolean; // 是否成功
}

export interface IPlatformResponse<T> {
  readonly errcode: number; // 0-成功，1-失败
  readonly errmsg: string; // 错误信息
  readonly data: T;
}

export function FGetRequestBody(params: object): string {
  return JSON.stringify(params);
}

export function FCommonResponseHandler<T>(res: ICommonResponse<T>): T {
  if (res.success) {
    return res.data;
  }
  throw new Error(res.errmsg);
  // throw res.message;
}
