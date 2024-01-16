declare namespace MaEnergySaveProjDM {
  export interface SearchForm {
    projectCode: string;
    year: string;
  }
  /**
   * 查询入参
   */
  export interface SearchParams extends SearchForm, GeneralModule.TenantVO {
    year: string;
  }
  /**
   * 详情
   */
  export interface EnergySaveProjVO {
    actualBillEndTime: string;
    actualBillStartTime: string;
    actualPrice: number;
    benchmarkValue: number;
    contractBillEndTime: string;
    contractBillStartTime: string;
    contractPrice: number;
    energyValue: number;
    month: number;
    saveValue: number;
    surplus: string;
  }
  /**
   * 基准值
   */
  export interface BasicValueVO extends BasicValueMaintainParams {
    id: number;
    createTime: number;
    updateTime: number;
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  }
  /**
   * 基准值维护入参
   */
  export interface BasicValueMaintainParams {
    tenantId: number;
    tenantCode: string;
    projectCode: number;
    projectName: string;
    january?: number;
    february?: number;
    march?: number;
    april?: number;
    may?: number;
    june?: number;
    july?: number;
    august?: number;
    september?: number;
    october?: number;
    november?: number;
    december?: number;
  }
}
