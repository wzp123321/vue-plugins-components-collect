export enum EA_ST_TABS {
  实时异常 = '1',
  昨日异常 = '2',
  边界异常 = '3',
}

export const EA_NO_AUTHORITY = '-1';

export interface EA_ITabAnomalyNum {
  actualTimeAlarmNumber: number;
  boundaryAlarmNumber: number;
  yesterdayAlarmNumber: number;
}
