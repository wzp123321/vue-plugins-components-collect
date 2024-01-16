export enum ESM_MeasureType {
  管理节能 = '管理节能',
  技术节能 = '技术节能',
}

export enum ESM_MeasureCode {
  技术节能 = '1',
  管理节能 = '2',
}

export enum ESM_EnergyType {
  电 = '电',
  水 = '水',
  燃气 = '燃气',
}

export enum ESM_EnergyCode {
  电 = '01000',
  水 = '02000',
  燃气 = '03000',
}

export interface ESM_EnergyCodeVO {
  code: string;
  name: string;
  unit: string;
}

export interface ESM_AddRequest {
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
  index?: number;
  savingType?: string;
  energyCode?: string;
  measureName?: string;
  remarks?: string;
  startTime: string;
  endTime: string;
}

export interface ESM_UpdateRequest {
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
  measureId?: number;
  year?: number;
  month?: number;
  value?: number;
}

export interface ESM_UpdateMeasureNameRequest {
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
  index?: number;
  measureId?: number;
  savingType?: string;
  energyCode?: string;
  measureName?: string;
}

export interface ESM_QueryListRequest {
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
  index: number | null;
  startTime: string;
  endTime: string;
  savingType?: string;
}

export interface ESM_QueryListResponse {
  headList: string[];
  /**
   * 技术节能
   */
  lineList: ESM_INextList[];
  /**
   * 总-头部
   */
  totalHeadList: string[];
  /**
   * 总-数据
   */
  totalLineList: ESM_INextList[];
  /**
   * 管理节能
   */
  nextList: ESM_INextList[];
}
// 表格数据
export interface ESM_INextList {
  tenantId: number;
  savingType: string;
  energyCode: string;
  energyName: string;
  energyUnit: string;
  measureId: number;
  measureName: string;
  dataList: number[];
  lineTotal: number;
  totalFlag: boolean;
  savingFlag: boolean;
  summaryFlag: boolean;
  remarks: string;
}

export interface ESM_PeriodList {
  end: object;
  index: number;
  name: string;
  start: object;
  status: boolean;
}
