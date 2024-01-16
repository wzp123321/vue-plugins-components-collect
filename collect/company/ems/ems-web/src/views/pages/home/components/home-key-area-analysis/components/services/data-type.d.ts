/** 分层分类模块 */
declare namespace EnergyCodeManageModule {
  /**
   * 查询分层分类params
   */
  interface EnergyQueryParams extends GlobalModule.CommonSearchParams {
    energyCode: string;
    keyWord: string;
  }
  /**
   * 分类分项公共数据
   */
  interface EnergyCodeCommonParams {
    co2Ratio?: number;
    coalRatio?: number;
    code: string;
    id?: number;
    name?: string;
    treeSort?: number;
    unit?: string;
    totalEnergyFlag?: number;
    standardPoints?: string;
  }
  /**
   * 分层分类详情
   */
  interface EnergyInfo extends EnergyCodeCommonParams {
    childEnergyCode: EnergyInfo[];
  }
  /**
   * 分层分类表单
   */
  interface EnergyCodeForm extends EnergyCodeCommonParams {
    moneyRatio?: number;
    parentCode: string | null;
    parentName: string;
  }
}
