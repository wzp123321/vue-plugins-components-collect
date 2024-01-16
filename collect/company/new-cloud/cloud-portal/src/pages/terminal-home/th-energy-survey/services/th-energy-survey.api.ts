/**
 * 能源概览接口返回详情
 * @param energyCode 能源类型CODE
 * @param energyName 能源类型名称
 * @param value 能源值
 * @param unit 单位
 * @param tbPrecent 同比
 * @param hbPrecent 环比
 */
export interface EnergySurveyVO {
  readonly energyCode: string;
  readonly energyName: string;
  readonly sum: number;
  readonly unit: string;
  readonly lastYearRatio: string;
  readonly lastMonthRatio: string;
}
/**
 * 能源概览详情
 * @param status 状态
 */
export interface EnergySurveyInfo extends EnergySurveyVO {
  readonly icon: string;
  readonly color: string;
  readonly lastYearStatus: number;
  readonly lastMonthStatus: number;
}

/**
 * 响应结果
 * @param energyOverviewVOS 参数列表
 * @param url 地址
 */
export interface EnergySurveyRes {
  energyOverviewVOS: EnergySurveyVO[];
  url: string;
}
