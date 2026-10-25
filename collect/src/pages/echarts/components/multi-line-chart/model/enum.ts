/**
 * 能耗趋势分析类型
 */
export enum EMcEnergyTrendAnalysisType {
  推荐参考值 = '0',
  推荐上限 = '1',
  设定参考值 = '2',
  设定上限 = '3',
}
/**
 * 配置类型
 */
export enum EMcConfigureType {
  日能耗参考 = '1',
  日能耗上限 = '2',
}
/**
 * 计算状态
 */
export enum EMcValueCalculateType {
  计算中 = '0',
  计算完成 = '1',
}
/**
 * 自定义图例类型
 */
export enum EMcLegendType {
  正方形 = '0',
  虚线 = '1',
  实线 = '2',
}

/**
 * 日能耗参考类型
 */
export enum EMiDailyEnergyStandardType {
  无 = '0',
  系统推荐 = '1',
  同类日期均值 = '2',
  指定日期 = '3',
}
/**
 * 日能耗上限类型
 */
export enum EMiDailyUpperLimitType {
  无 = '0',
  系统推荐 = '1',
  参考值上浮比例 = '2',
  固定值 = '3',
}
