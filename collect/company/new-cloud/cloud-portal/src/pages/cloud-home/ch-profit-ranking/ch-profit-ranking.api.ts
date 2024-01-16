export enum CH_ProfitRankTimeType {
  毛利 = '0',
  毛利率 = '1',
}

export interface CH_ProfitRankDataType {
  surplusRankList: CH_SurplusListType[];
  unit: string;
}

export interface CH_SurplusListType {
  rankOrder: number;
  surplus: number;
  tenantName: string;
}
