export enum EOEA_EColorType {
  环比 = '#a83bff',
  同比 = '#ff9120',
  正常 = '#3681FF',
  同比或环比超出阈值异常 = '#FFCB20',
}

// 折线图响应结果
export interface EOEA_IBarChatRes {
  // 柱状图数据
  lineChartSeriesList: EOEA_ILineChartSeriesList[];
  // 横轴
  xaxisTimes: string[];
  // y轴
  yaxisItemList: EOEA_IYaxisVO[];
  // 柱状图颜色
  colorList: string[];
  // 图例
  colorDescList: EAEO_ILastYearRatioList[];
  // 同比
  lastYear: boolean;
  // 环比
  lastMonth: boolean;
}
// y轴
export interface EOEA_IYaxisVO {
  title: string;
  unit: string;
}
// series数据
export interface EOEA_ILineChartSeriesList {
  energyType: string;
  lineChartDataList: EODA_ILineChartDataList[];
}
// series line数据
export interface EODA_ILineChartDataList {
  treeId: number;
  name: string;
  time: string;
  type: string;
  value: number | null;
  lastYearValue: number | null;
  lastMonthValue: number | null;
  lastYearRatio: number | null;
  lastMonthRatio: number | null;
}
// 同比 百分比
export interface EAEO_ILastYearRatioList {
  color: string;
  desc: string;
  status: string;
  time: string;
  treeId: number;
  value: number;
}
