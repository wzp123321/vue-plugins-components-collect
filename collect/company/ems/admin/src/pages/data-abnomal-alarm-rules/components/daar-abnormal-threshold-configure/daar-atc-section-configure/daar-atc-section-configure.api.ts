import { EThresboldStatus } from '../../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import { EDaarAbnormalType, EDaarThresholdType, EDaarAlarmLevel } from '../../../data-abnomal-alarm-rules.api';

export const MAX_COUNT = 5;
export const EXCEPTION_LOWLIMIT_MESSAGE = '区间下限不可为无穷数值，请重新输入';
export const EXCEPTION_INCOHERENCE_MESSAGE = '区间数值不连贯，请重新输入';
export const EXCEPTION_EXCEED_MESSAGE = '同一区间下限数值需小于上限数值，请重新输入';
export const EXCEPTION_THRESHOLD_COMPARE_MESSAGE = '普通阈值不可大于严重阈值';
export const EXCEPTION_THRESHOLD_EMPTY__MESSAGE = '异常阈值不可为空';
export const EXCEPTION_THRESHOLD_ZERO__MESSAGE = '异常阈值不可为0';

// 告警区间配置参数
export interface Daar_IUpdateAlarmSectionParams {
  abnormalType: EDaarAbnormalType;
  alarmLevel: EDaarAlarmLevel;
  alarmLevelName: string;
  energyCode: string;
  energyCodeName: string;
  limitThresholds: Daar_IThresholdLimitVO[];
  status: EThresboldStatus;
  thresholdName: string;
  thresholdType: EDaarThresholdType;
}

// 参数-区间详情
export interface Daar_IThresholdLimitVO {
  general: string;
  serious: string;
  lowerLimit: string;
  upperLimit: string;
}

// 异常详情
export interface Daar_IThresholdErrorVO {
  rowIndex: number;
  columnIndex: number;
}
