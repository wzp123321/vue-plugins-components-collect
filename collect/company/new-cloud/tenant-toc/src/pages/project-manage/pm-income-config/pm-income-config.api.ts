/*
 * @Author: yut
 * @Date: 2023-10-08 16:53:22
 * @LastEditors: yut
 * @LastEditTime: 2023-12-12 10:17:48
 * @Descripttion:
 */
export enum EPath {
  查询托管周期 = '/baseHead/queryHostingPeriods',
  查询定值指标详情数据 = '/incomeShare/queryConstantInfo',
  定值指标保存接口 = '/incomeShare/saveConstantInfo',

  查询运维或维保服务费 = '/projectManagement/queryCheckFeeValue',
  保存运维或维保服务费 = '/projectManagement/saveCheckFeeValue',

  保存固定收益 = '/projectManagement/saveRetainingIncome',
  查询固定收益 = '/projectManagement/queryRetainingIncome',
}
/**
 * 弹窗数据来源
 */
export enum EServiceCharge {
  运维服务费 = '1',
  维保服务费 = '2',
}

export interface IPIC_Params {
  years?: (string | number | null)[];
  months?: (string | number | null)[];
  value?: string | number | null;
}

export interface IPIC_TableData {
  headList: string[];
  bodyList: IPIC_TableRow[];
}

export interface IPIC_TableRow {
  periodName: string;
  dateList: string[];
  values: (number | string | null)[];
}

/**
 * 保存接口入参
 */
export interface IPIC_SaveParams extends IPIC_Params {
  costType?: string;
  incomeShareType?: string;
  serialNumber?: string;
  tenantId: number;
}

export interface IPIC_Index {
  serialNumber: string;
  indexName: string;
}

export type IPIC_IBaseHeadQueryHostingPeriodsResponse = {
  code: number;
  name: string;
  status: boolean;
  start: any;
  months: string;
  end: any;
};
