import {
  AlarmLevel,
  AlarmStatus,
  EAlarmLabel,
  OperationStatus,
} from '../api/index.api';

// 系统前缀
export const IMS_SYSTEM_PREFIX = '/energy/ims/ims-web';

// 告警查询页面url
export const ALARM_QUERY_PAGE = '/alarmSearch';

/** 告警状态 */
export const optionsAlarmStatus = [
  { code: AlarmStatus.ALARM, name: '正在告警' },
  { code: AlarmStatus.RECOVER, name: '已恢复' },
];

/** 处理状态 */
export const optionsDealProcess = [
  { code: OperationStatus.UNCONFIRMED, name: '未确认' },
  { code: OperationStatus.CONFIRMED, name: '已确认' },
];

// 5s 轮询表格数据更新
export const TABLE_DATA_POLL_INTERVAL = 5000;

// 5s 轮询告警数据
export const ALARM_POLL_INTERVAL = 5000;

// 告警等级排序
export const LEVEL_RANK: Record<AlarmLevel, number> = {
  [AlarmLevel.CRITICAL]: 4,
  [AlarmLevel.MAJOR]: 3,
  [AlarmLevel.MINOR]: 2,
  [AlarmLevel.INFO]: 1,
};

/** 24h 角标时间窗（毫秒） */
export const BADGE_WINDOW_MS = 24 * 60 * 60 * 1000;

// 告警标签颜色映射
export const ALARM_LABEL_MAP: any = {
  [EAlarmLabel.近期初次出现]: { name: '近期初次出现', type: 'default' },
  [EAlarmLabel.设备离线]: { name: '设备离线', type: 'danger' },
  [EAlarmLabel.反复告警]: { name: '反复告警', type: 'danger' },
  [EAlarmLabel.长期未恢复]: { name: '长期未恢复', type: 'danger' },
  [EAlarmLabel.超限值较大]: { name: '超限值较大', type: 'warning' },
  [EAlarmLabel.设备告警数量较多]: { name: '设备告警数量较多', type: 'warning' },
  [EAlarmLabel.长期未处理]: { name: '长期未处理', type: 'warning' },
  [EAlarmLabel.近期修改告警规则]: { name: '近期修改告警规则', type: 'default' },
};

export const PAGE_SIZES = [10, 20, 30, 40, 50];
