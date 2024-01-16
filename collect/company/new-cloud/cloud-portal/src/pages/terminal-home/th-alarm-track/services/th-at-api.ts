export interface AlarmTrackVO {
  alarmLevel: string;
  alarmLevelName: string;
  handledValue: number;
  totalValue: number;
}

export interface AlarmTrackInfo extends Omit<AlarmTrackVO, 'handledValue' | 'totalValue'> {
  handledValue: string;
  totalValue: string;
  precent: number;
  color: string;
  backgroundColor: string;
}

export interface AlarmSummaryRes {
  alarmSummaryVOS: AlarmTrackVO[];
  url: string;
}
