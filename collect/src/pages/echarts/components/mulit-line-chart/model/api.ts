export interface IMcValueInfo {
  workdayValue: string; // 工作日
  holidayValue: string; // 非工作日
}
/**
 * 监控策略
 */
export interface IMcMonitoringConfigureInfo {
  benchPolicy: string; // 日能耗参考策略
  upperPolicy: string; // 日能耗上限策略
  benchStartTime: string; // 日能耗参考开始时间
  benchEndTime: string; // 日能耗参考结束时间
  upperStartTime: string; // 日能耗上限开始时间
  upperEndTime: string; // 日能耗上限结束时间
  specialConfig: string; // 特殊值 ---日能耗上限-上浮比例
  benchWorkdayValue: string; // 基准工作日值
  benchHolidayValue: string; // 基准非工作日值
  upperWorkdayValue: string; // 上限工作日值
  upperHolidayValue: string; // 上限非工作日值
  benchStatus: string; // 基准是否在计算中
  upperStatus: string; // 上限是否在计算中
}
/**
 * 在原配置基础上增加已应用的字段，用于展示已应用
 */
export interface IMcConvertMonitoringConfigureInfo
  extends IMcMonitoringConfigureInfo {
  applicationBenchPolicy: string; // 日能耗参考策略
  applicationBenchStartTime: string; // 日能耗参考开始时间
  applicationBenchEndTime: string; // 日能耗参考结束时间
  applicationBenchWorkdayValue: string; // 基准工作日值
  applicationBenchHolidayValue: string; // 基准非工作日值

  applicationUpperPolicy: string; // 日能耗上限策略
  applicationUpperStartTime: string; // 日能耗上限开始时间
  applicationUpperEndTime: string; // 日能耗上限结束时间
  applicationUpperWorkdayValue: string; // 上限工作日值
  applicationUpperHolidayValue: string; // 上限非工作日值
}
/**
 * 监控策略
 */
export interface IMcMonitoringConfigureForm {
  start: string;
  end: string;
  policyInfo: IMcConvertMonitoringConfigureInfo;
}
/**
 * 能耗参考值分析图表
 */
export interface IMcStandardChartRes {
  startTime: string; // 起始时间
  endTime: string; // 结束时间
  workdayRecommendBench: string; // 推荐参考值
  workdayRecommendUpper: string; // 推荐上限
  workdayLineBar: [(string | null)[], (string | null)[]]; // 工作日设定参考值、设定上限
  holidayRecommendBench: string; // 推荐参考值
  holidayRecommendUpper: string; // 推荐上限
  holidayLineBar: [(string | null)[], (string | null)[]]; // 非工作日设定参考值、设定上限
  workdayBar: string[][]; // 工作日-日期分组
  holidayBar: string[][]; // 非工作日-日期分组
  workdayBarData: [string[], (string | null)[]]; // 工作日第一个数组是x轴，第二个数组是数据列表
  holidayBarData: [string[], (string | null)[]]; // 非工作日第一个数组是x轴，第二个数组是数据列表
}
/**
 * 能耗参考值分析表单
 */
export interface IMcStandardForm {
  date: [string, string];
  checkedTypeList: string[];
}
/**
 * 查询系统推荐值入参
 */
export interface IMcQuerySystemValueParams {
  pointId: number;
  energyDimension: string;
  policy: string;
  start: string;
  end: string;
}

export interface IMcSaveConfigureInfo {
  start: string | null;
  end: string | null;
  benchType: string;
  benchStart: string;
  benchEnd: string;
  benchValueWorkday: string;
  benchValueHoliday: string;
  upperType: string;
  upperStart: string;
  upperEnd: string;
  upperValueWorkday: string;
  upperValueHoliday: string;
  floatingRate: string;
}
/**
 * 保存入参
 */
export interface IMcSaveParams {
  pointName: string;
  pointId: number;
  year: string;
  seasonConfig: IMcSaveConfigureInfo[];
}
/**
 * 自定义图例
 */
export interface IMcCustomLegend {
  name: string;
  color: string;
  selected: boolean;
  icon: string;
}
/**
 * 季节表单
 */
export interface IMcSeasonForm {
  startMonth: string;
  startDay: string;
  endMonth: string;
  endDay: string;
}
/**
 * 折线图数据
 */
export interface IMcLineSeriesData {
  value: string | null;
  date: string;
  groupName: string;
  itemStyle: { color: string };
}
/**
 * 已选时段
 */
export interface IMcSelectedPeriodVO {
  month: number;
  day: number;
}
export interface IMcSelectedPeriod {
  start: IMcSelectedPeriodVO;
  end: IMcSelectedPeriodVO;
}

/**
 * 当前应用的配置
 */
export interface IMcCurrentApplicationConfig {
  benchPolicy: string; // 日能耗参考策略
  benchStartTime: string; // 日能耗参考开始时间
  benchEndTime: string; // 日能耗参考结束时间
  benchWorkdayValue: string; // 基准工作日值
  benchHolidayValue: string; // 基准非工作日值
}
