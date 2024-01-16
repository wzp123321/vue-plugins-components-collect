export interface Daar_IAnalyseThresholdValueVO {
  abnormalType: string;
  abnormalTypeName: string;
  id: number;
  status: string;
  threshold: string;
}

export interface Daar_IAnalyseUpdateStatusParams {
  id: number;
  status: EThresboldStatus;
  reason: string;
}

export interface Daar_IAnalyseEditParams {
  id: number;
  threshold: string;
  abnormalTypeName: string;
}

// 异常阈值开关状态
export enum EThresboldStatus {
  开启 = '1',
  关闭 = '0',
}
