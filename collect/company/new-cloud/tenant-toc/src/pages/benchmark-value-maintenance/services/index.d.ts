declare namespace BenchmarkValueMaintenance {
  /**
   * 基准值表格 & 月度比例表 查询接口入参
   * @param energyCode 	能源类型编码
   * @param hostingId 	托管院区ID
   * @param tenantCode 	租户编号
   * @param tenantId 	租户ID
   * @param year 	年份
   */
  export interface queryBenchmarkValueMaintenanceList {
    energyCode?: string;
    hostingId?: number;
    tenantCode: string;
    tenantId: number;
    year?: number;
  }

  /**
   * 表格查询接口返回 list
   * @param month 月份
   * @param benchmarkValue 基准量
   * @param price 合同单价
   * @param amount 基准金额
   * @param contractBillStartTime 合同账期开始时间
   * @param contractBillEndTime 合同账期合同账期开始时间时间
   * @param priceRiskUpperLimit 合同单价风险上限
   * @param priceRiskLowerLimit 合同单价风险下限
   * @param retrofitBeforeValue 改造前能耗
   * @param energyUnit 能耗单位
   */
  export interface benchmarkValueMaintenanceListVO {
    month: string;
    benchmarkValue: number | null;
    price: number | null;
    amount: number | null;
    contractBillStartTime: string | null;
    contractBillEndTime: string | null;
    priceRiskUpperLimit: number | null;
    priceRiskLowerLimit: number | null;
    retrofitBeforeValue: number | null;
    energyUnit: string | null;
  }

  /**
   * 月度比例表 修改接口入参
   * @param contractBillEndTime 		合同账期结束时间
   * @param contractBillStartTime 	合同账期开始时间
   * @param energyCode 	能源类型编码
   * @param month 	月份
   * @param priceRiskLowerLimit 	合同单价风险下限
   * @param priceRiskUpperLimit 	合同单价风险上限
   * @param tenantCode 		租户编号
   * @param tenantId 		租户ID
   * @param year 	年份
   */
  export interface updateBenchmarkValueMaintenance {
    contractBillEndTime: string;
    contractBillStartTime: string;
    energyCode?: string;
    month: number;
    priceRiskLowerLimit?: number | null;
    priceRiskUpperLimit?: number | null;
    tenantCode: string;
    tenantId: number;
    year?: number;
  }

  /**
   * 月度比例表 查询返回参数 & 更新入参
   * @param createTime 	创建时间
   * @param updateTime 更新时间
   * @param tenantId 	租户编码
   * @param tenantCode 	租户id
   * @param energyCode 分类分项编码
   * @param january 一月
   * @param february 二月
   * @param march 三月
   * @param april 四月
   * @param may 五月
   * @param june 六月
   * @param july 七月
   * @param august 八月
   * @param september 九月
   * @param october 十月
   * @param november 十一月
   * @param december 十二月
   */
  export interface HouseholdNumberListVO {
    id?: number;
    createTime?: number;
    updateTime?: number;
    tenantId: number;
    tenantCode: string;
    energyCode: string;
    january: number;
    february: number;
    march: number;
    april: number;
    may: number;
    june: number;
    july: number;
    august: number;
    september: number;
    october: number;
    november: number;
    december: number;
  }

  /**
   * 搜索表单
   * @param hostingScope 托管范围
   * @param date 查询年份
   * @param energyType 能源类型
   *
   */
  export interface FormInlineType {
    hostingScope: string | undefined;
    date: string | undefined;
    energyType: string | undefined;
  }

  /**
   * 托管范围&查询年份&能源类型下垃list
   */
  export interface EnergyType {
    code: string;
    name: string;
    unit?: string;
  }

  /**
   * 编辑弹框表单
   * @param priceRiskLowerLimit 合同单价风险区间 下限
   * @param priceRiskUpperLimit 合同单价风险区间 上限
   * @param date 合同账期
   */
  export interface EditFormType {
    priceRiskLowerLimit: string | undefined | null | number;
    priceRiskUpperLimit: string | undefined | null | number;
    date: [Date, Date];
  }

  /**
   * 月度明细表弹框表单
   */
  export interface MonthlyFormType {
    january: number | undefined;
    february: number | undefined;
    march: number | undefined;
    april: number | undefined;
    may: number | undefined;
    june: number | undefined;
    july: number | undefined;
    august: number | undefined;
    september: number | undefined;
    october: number | undefined;
    november: number | undefined;
    december: number | undefined;
  }
}
