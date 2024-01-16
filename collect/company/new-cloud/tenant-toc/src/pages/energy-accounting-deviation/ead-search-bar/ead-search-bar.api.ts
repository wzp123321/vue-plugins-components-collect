/**
 * 表单
 */
export interface EadISearchForm {
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
  hostingAreaId?: number | null;
}

// 查询入参
export interface EadIQueryParams extends Omit<EadISearchForm, 'periodType' | 'hostingPeriodIndex'> {
  /**
   * 日期  月:yyyy-MM  年:yyyy
   */
  startTimeStr?: string;
  /**
   * 日期  月:yyyy-MM  年:yyyy
   */
  endTimeStr?: string;
  /**
   * 租户id
   */
  tenantId: number;
  /**
   * 租户code
   */
  tenantCode: string;
}

// 时间范围类型
export enum EadEDatePickerType {
  年范围 = 'yearrange',
  月范围 = 'monthrange',
}
// 时间选择器宽度
export const DATE_PICKER_WIDTH = 328;
