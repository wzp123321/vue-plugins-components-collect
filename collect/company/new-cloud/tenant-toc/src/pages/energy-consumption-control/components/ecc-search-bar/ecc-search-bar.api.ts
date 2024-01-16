export enum EccEPath {
  查询能耗管控时间可选范围 = '/energyControl/queryEnergyControlTime',
}
// 周期类型
export enum EccSbEPeriodType {
  按托管期 = '0',
  按年 = '1',
  按月 = '2',
}
// 能耗管控可选时间
export interface EccIDateScopeVO {
  startTimeMillis: number | null;
  endTimeMillis: number | null;
}
/**
 * 表单
 */
export interface Ecc_ISearchForm {
  /**
   * 能源类型code
   */
  energyCode: string;
  /**
   * 周期类型（0：按托管期 1：按年 2：按月）
   */
  periodType: string;
  /**
   * 查询第n托管期时间
   */
  hostingPeriodIndex?: number | null;
  /**
   * 日期  月:yyyy-MM  年:yyyy
   */
  yearMonthStr?: Date[];
  /**
   * 托管区域id null即全部
   */
  hostingAreaId?: string;
}
