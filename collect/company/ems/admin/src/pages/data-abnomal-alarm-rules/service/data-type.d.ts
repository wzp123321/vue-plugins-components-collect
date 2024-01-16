declare namespace AbnomalAlarmRulesHttp {
  export interface UpdatedEngAlyData {
    id: number;
    reason?: string;
    abnormalType?: string;
    threshold?: number | null;
    status?: string;
  }
  export interface UpdatedAlarmRulesData {
    id: number;
    alarmLevelText?: string;
    threshold?: number;
    status?: string;
  }
  export interface UpdatedEngAbnormalData {
    id: number;
    alarmLevelName?: string;
    general?: number | null;
    serious?: number | null;
    status?: string;
  }
  export interface UpdatedDataColor {
    id: number;
    colorCode: string;
    colorName: string;
  }
  export interface SaveAlarmStartData {
    id: number;
    energyCode: string;
    deadbandValue: number;
  }
  export interface GetLogData {
    id: number;
    pageNum: number;
    pageSize: number;
  }
  export interface GetAlarmStartData {
    id: number;
    name: string;
    code: string;
    unit: string;
  }
}
