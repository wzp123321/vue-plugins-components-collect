export interface HospitalDataDataRequest {
  pageNum?: number;
  pageSize?: number;
  searchCount?: boolean;
  orders?: {
    column?: string;
    asc?: boolean;
  }[];
  /**
   * 综能项目库医院id
   */
  hospitalId?: number;
  /**
   * 开始时间
   */
  startTime?: string | null;
  /**
   * 结束时间
   */
  endTime?: string | null;
  /**
   * 版本id
   */
  versionId?: number | string;
  /**
   * 数据类型 预留： 1-历史能耗，2-业务量
   */
  type?: string;
}

export interface HospitalDataDataResponse {
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
  list: HospitalDataList[];
}

export interface HospitalDataList {
  /**
   * 医院ID
   */
  hospitalId?: number;
  /**
   * 医院名称
   */
  hospitalName?: string;
  /**
   * 院区名称
   */
  hospitalArea?: string;
  /**
   * 年份
   */
  year?: number;
  /**
   * 月份
   */
  month?: number;
  /**
   * 年度月份
   */
  yearMonthStr?: string;
  /**
   * 建筑面积
   */
  architectureArea?: number;
  /**
   * 面积修正
   */
  areaCorrection?: number;
  /**
   * 电数据id
   */
  eleDataId?: number;
  /**
   * 电量
   */
  eleAmount?: number;
  /**
   * 电费
   */
  eleCost?: number;
  /**
   * 电单价
   */
  elePrice?: number;
  /**
   * 电量修正：帐期
   */
  eleAccountPeriodCor?: number;
  /**
   * 电单位面积用量
   */
  eleAmountPerUnit?: number;
  /**
   * 电量修正：面积
   */
  eleEnergyAreaCor?: number;
  /**
   * 电量修正：设备
   */
  eleDeviceCor?: number;
  /**
   * 电量修正：天气
   */
  eleWeatherCor?: number;
  /**
   * 电量修正：其他
   */
  eleOtherCor?: number;
  /**
   * 电量用量：修正后
   */
  eleAmountAfterCor?: number;
  /**
   * 水数据id
   */
  waterDataId?: number;
  /**
   * 水量
   */
  waterAmount?: number;
  /**
   * 水费
   */
  waterCost?: number;
  /**
   * 水单价
   */
  waterPrice?: number;
  /**
   * 水量修正：帐期
   */
  waterAccountPeriodCor?: number;
  /**
   * 水单位面积用量
   */
  waterAmountPerUnit?: number;
  /**
   * 水量修正：面积
   */
  waterEnergyAreaCor?: number;
  /**
   * 水量修正：设备
   */
  waterDeviceCor?: number;
  /**
   * 水量用量：修正后
   */
  waterAmountAfterCor?: number;
  /**
   * 燃气数据id
   */
  gasDataId?: number;
  /**
   * 燃气量
   */
  gasAmount?: number;
  /**
   * 燃气费
   */
  gasCost?: number;
  /**
   * 燃气单价
   */
  gasPrice?: number;
  /**
   * 燃气量修正：帐期
   */
  gasAccountPeriodCor?: number;
  /**
   * 燃气单位面积用量
   */
  gasAmountPerUnit?: number;
  /**
   * 燃气量修正：面积
   */
  gasEnergyAreaCor?: number;
  /**
   * 燃气量修正：设备
   */
  gasDeviceCor?: number;
  /**
   * 燃气量修正：天气
   */
  gasWeatherCor?: number;
  /**
   * 燃气量用量：修正后
   */
  gasAmountAfterCor?: number;
  /**
   * 蒸汽数据id
   */
  steamDataId?: number;
  /**
   * 蒸汽量
   */
  steamAmount?: number;
  /**
   * 蒸汽费
   */
  steamCost?: number;
  /**
   * 蒸汽单价
   */
  steamPrice?: number;
  /**
   * 蒸汽量修正：帐期
   */
  steamAccountPeriodCor?: number;
  /**
   * 蒸汽单位面积用量
   */
  steamAmountPerUnit?: number;
  /**
   * 蒸汽量修正：面积
   */
  steamEnergyAreaCor?: number;
  /**
   * 蒸汽量修正：天气
   */
  steamWeatherCor?: number;
  /**
   * 蒸汽量用量：修正后
   */
  steamAmountAfterCor?: number;
}

export enum TableType {
  历史能耗 = '1',
  业务量 = '2',
}
