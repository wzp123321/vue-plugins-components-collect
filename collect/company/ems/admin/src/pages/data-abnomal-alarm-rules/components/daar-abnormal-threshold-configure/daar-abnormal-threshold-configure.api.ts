import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';
import { EDaarAbnormalType, EDaarThresholdType, EDaarAlarmLevel } from '../../data-abnomal-alarm-rules.api';
import { Common_ICodeName } from '@/services/common/common-api';

// 详情
export interface Daar_IRealtimeAbnormalThresholdVO {
  id: number;
  abnormalType: EDaarAbnormalType;
  thresholdType: EDaarThresholdType;
  thresholdName: string;
  energyCode: string;
  energyCodeName: string;
  upperLimit: string; // 能耗区间上限
  lowerLimit: string; // 能耗区间下限
  general: string; // 普通异常值
  serious?: string; // 严重异常值
  alarmLevel: EDaarAlarmLevel;
  alarmLevelText: string;
  status: EThresboldStatus;
}

// 编辑状态入参
export interface DaarIRealTimeUpdateStatusParams {
  abnormalType: EDaarAbnormalType;
  energyCode: string;
  status: EThresboldStatus;
  thresholdType: EDaarThresholdType;
  reason: string;
}

export interface Daar_IUpdateStatusParams {
  row: Daar_IRealtimeAbnormalThresholdVO | null;
  reason: string;
}

export interface Daar_IEnergyVO extends Common_ICodeName {
  unit: string;
}
