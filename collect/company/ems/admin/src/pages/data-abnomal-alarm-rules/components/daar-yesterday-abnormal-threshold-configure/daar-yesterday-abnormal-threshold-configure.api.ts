import { EThresboldStatus } from '../daar-analyse-thresholdvalue-configure/daar-analyse-thresholdvalue-configure.api';

export interface Daar_IYesterdayAbnormalVO {
  abnormalType: number;
  abnormalTypeName: string;
  alarmLevel: string;
  alarmLevelText: string;
  general: string;
  id: number;
  serious: string;
  status: string;
  thresholdName: string;
  thresholdType: string;
}

export interface IYesterdayAbnormalUpdateStatusParams {
  id: number;
  status: EThresboldStatus;
  reason: string;
}
