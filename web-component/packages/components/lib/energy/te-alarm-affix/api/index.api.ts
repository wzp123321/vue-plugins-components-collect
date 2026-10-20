/** 4 个系统标识 */
export type AppSystemCode = 'ims' | 'ems' | 'emc' | 'entron';

// 是否启用闭锁值
export enum EAlarmLockoutFlag {
  未启用 = '0',
  启用 = '1',
}

// 是否时电压类型
export enum EVoltageFlag {
  不是 = '0',
  是 = '1',
}

// 告警标签
export const enum EAlarmLabel {
  近期初次出现 = '1',
  设备离线 = '2',
  反复告警 = '3',
  长期未恢复 = '4',
  超限值较大 = '5',
  设备告警数量较多 = '6',
  长期未处理 = '7',
  近期修改告警规则 = '8',
}

// 告警等级
export enum AlarmLevel {
  CRITICAL = 'serious', // 严重
  MAJOR = 'important', // 重要
  MINOR = 'secondary', // 次要
  INFO = 'info', // 提示
}

// 告警/事件类型
export enum AlarmType {
  ALARM = '2', // 实时告警
  EVENT = '1', // 实时事件
}

/* 通知停留时长 */

/** 弹窗停留时长(秒),-1 表示"手动关闭";与后端 popupStayTime 字段类型一致 */
export type NoticeDuration = -1 | 3 | 5 | 10;

export const NOTICE_DURATION_OPTIONS: ReadonlyArray<{
  value: NoticeDuration;
  label: string;
}> = [
  { value: 3, label: '3 秒' },
  { value: 5, label: '5 秒' },
  { value: 10, label: '10 秒' },
  { value: -1, label: '手动关闭' },
];

// 开关状态
export enum SwitchFlag {
  OFF = '0',
  ON = '1',
}

// 应用范围
export interface AppScopeItemVO {
  code: string; // 后端小写:ims / ems / emc / entron
  name: string;
  selected: boolean;
}

// 告警等级
export type AlarmLevelItemDto = AppScopeItemVO;

// 专业模块
export interface SystemItemVO {
  id: string; // 含 "-1" 代表未分配专业
  name: string;
  selected: boolean;
}

// 告警通知配置
export interface AlarmNoticeConfigVO {
  id?: number | null;
  applicationScopeList: AppScopeItemVO[];
  alarmSoundSwitch: SwitchFlag;
  eventSoundSwitch: SwitchFlag;
  popupNotificationSwitch: SwitchFlag;
  popupStayTime: number; // 秒；-1 表示"手动关闭"
  listPopupSwitch: SwitchFlag;
  subscribeAlarmLevelList: AlarmLevelItemDto[];
  subscribeEventLevelList: AlarmLevelItemDto[];
  subscribeSystemList: SystemItemVO[];
  noDisturbanceSwitch: SwitchFlag;
  noDisturbanceStartTime: string; // 'HH:mm'
  noDisturbanceEndTime: string; // 'HH:mm'
}

// 轮询的告警
export interface AlarmNotifyItem {
  id: number; // ID
  objectId: number; // 业务对象唯一id
  objectType: string; // 业务对象属性: 1设备 2集中器 3点位 4重大设备 5空间
  objectName: string; // 业务对象名称
  pointId: number; // 外键 base_device_point 的id 点位id
  originAlarmTypeId: number; // 原始告警类型id
  transAlarmTypeId: number; // 转义告警类型id
  levelCode: string; // 告警等级
  spaceId: string; // 空间ID
  spaceName: string; // 空间名称
  alarmSystem: string; // 系统模块
  alarmSource: string; // 告警来源
  content: string; // 告警的内容
  generationTime: string; // 告警产生时间
  suggest: string; // 处理建议
  operationStatus: string; // 0未处理 1已确认 2已下单
  status: string; // 0告警中 1已恢复
  resumeTime: string; // 告警恢复的时间
  originAlarmTypeName: string; // 原始告警名称
  transAlarmTypeName: string; // 转义告警名称
  resumeId: string; // 恢复时详细信息id
  systemId: string; // 系统code
  detailId: string; // 详细信息Id
  systemName: string; // 系统名称
  deviceId: number; // 设备id
  standardPointCode: string; // 标准点位
  pointNumber: number; // 点位
  highPrecisionFlag: string; // 0无 1有
  lowPrecisionFlag: string; // 0无 1有
  historyFlag: string; // 0不存储 1存储
  mergeCount: number; // 合并数量
  alarmPointName: string; // 告警点位
  triggerValue: string; // 触发值
  triggerCondition: string; // 告警条件
  alarmLabel: string; // 告警标签 逗号分割
  labelList: string[]; // 告警标签集合
  operator: string; // 确认人
  operateTime: string; // 确认时间
  alarmEventType?: AlarmType; // 通知类型 2告警 1事件
  deviceName?: string; // 设备名称
}

// 告警状态
export enum AlarmStatus {
  ALARM = '0', // 正在告警
  RECOVER = '1', // 已恢复
}

// 处理状态
export enum OperationStatus {
  UNCONFIRMED = '0', // 未确认
  CONFIRMED = '1', // 已确认
}

/**
 * 组态图链接
 */
export interface IAlarmLinkList {
  drawId: number;
  drawName: string;
  systemId: string;
  url: string;
}

export interface AlarmInfo {
  id: number; // 唯一标识
  objectId: number; // 业务对象唯一id
  objectType: string; // 业务对象属性:1设备 2集中器 3点位 4重大设备 5空间
  objectName: string; // 业务对象名称
  pointId: number; // 外键 base_device_point 的id
  originAlarmTypeId: number; // 原始告警类型id
  transAlarmTypeId: number; // 原始告警类型id
  levelCode: string; // 告警等级
  spaceId: string; // 空间ID
  spaceName: string; // 空间名称
  alarmSystem: string; // 系统模块
  alarmSource: string; // 告警来源
  content: string; // 告警的内容
  generationTime: string; // 告警生成时间
  suggest: string; // 处理建议
  operationStatus: string; // 0:未处理 1:已确认 2:已下单
  status: string; // 0:告警中 1:已恢复
  resumeTime: string; // 告警恢复的时间
  originAlarmTypeName: string; // 原始告警名称
  transAlarmTypeName: string; // 转义告警名称
  resumeId: string; // 恢复时详细信息id
  systemId: string; // 系统code
  detailId: string; // 详细信息Id
  systemName: string; // 系统名称
  deviceId: number; // 设备id
  standardPointCode: string; // 标准点位
  pointNumber: number; // 点位
  highPrecisionFlag: string; // 是否有高精度曲线 0:无 1:有
  lowPrecisionFlag: string; // 是否有低精度曲线 0:无 1:有
  historyFlag: string; // 是否有历史采样存储数据 0:不存储 1:存储
  mergeCount: number; // 告警点位
  alarmPointName: string; // 告警点位
  triggerValue: string; // 触发值
  triggerCondition: string; // 告警条件
  alarmLabel: string; // 告警标签
  labelList: string[]; // 告警标签集合
  operator: string; // 确认人
  operateTime: string; // 确认时间
  alarmEventType: string; // 通知类型, 1: 事件, 2: 告警
  levelName: string; // 告警等级名称
  statusName: string; // 告警状态名称
  operationStatusName: string; // 处理状态名称
  deviceName: string; // 设备名称
}

/* 表格过滤条件 */

export interface AlarmFilters {
  spaceCodeList: string[]; // 当前所选院区 id 列表(所有告警/事件接口均需传入)
  alarmLevelList: AlarmLevel[]; // 当前所选告警等级列表
  systemIdList: string[]; // 当前所选专业模块列表
  operationStatus: string; // 处理状态
  status?: string; // 告警状态
  keyword: string;
  startTime: string; // 开始时间-当前时间的前24h
  endTime: string; // 结束时间-当前时间
}

/** 告警分页请求:POST /alarm/queryRealTimeAlarmPage(含 status) */
export interface AlarmPageQuery extends AlarmFilters {
  pageNum: number;
  pageSize: number;
}

/** 事件分页请求:POST /alarm/queryRealTimeEventPage(无 status) */
export interface EventPageQuery extends Omit<AlarmFilters, 'status'> {
  pageNum: number;
  pageSize: number;
}

/** 分页响应(告警/事件共用) */
export interface PageResponse {
  list: AlarmInfo[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 告警/事件合并计数响应
 */
export interface AlarmEventCountVO {
  alarmCount: number; // 24h 窗口内告警未确认数
  eventCount: number; // 24h 窗口内事件未确认数
  maxAlarmLevel: string; // 当前所有告警中的最高等级
}

// 公共请求
export interface IResTemplate<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export interface BatchConfirmAlarmBody {
  /** 告警/事件 id 列表(单条也走 list 形式) */
  idList: number[];
  /** 告警(2) / 事件(1) */
  type: AlarmType;
  /** 单条确认时附带备注,批量可不传 */
  comment?: string;
}
