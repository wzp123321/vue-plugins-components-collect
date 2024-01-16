export enum ACC_EEfficiencyRank {
  优 = 1,
  良,
  中,
  差,
}

export enum ACC_EStrategyType {
  自动 = 1,
  工单,
}

export enum ACC_EStrategyState {
  未下发 = '未下发',
  已下发 = '已下发',
  下发失败 = '下发失败',
  已执行 = '已执行',
  执行失败 = '执行失败',
}

export interface ACC_IQuery {
  system: number;
}

export interface ACC_ISystemItem {
  id: number;
  name: string;
}

export interface ACC_ICardItem {
  name: string;
  code: string | number;
  value: string;
  unit?: string;
}
export interface ACC_IEfficiencyRatio extends ACC_ICardItem {
  rank: ACC_EEfficiencyRank;
  thresholds: number[];
}

export interface ACC_ICardSeriesItem {
  name: string;
  unit?: string;
  data: string[];
  threshold?: number;
}

export interface ACC_IMonthChart {
  title: string;
  dates: Date[];
  series: ACC_ICardSeriesItem;
}

export interface ACC_IOverviewDetailItem {
  title: string;
  value: string;
  unit: string;
}
export interface ACC_IOverviewItem {
  range: string;
  space: ACC_IOverviewDetailItem;
  cost: ACC_IOverviewDetailItem;
}

export interface ACC_IChartSeriesItem {
  name: string;
  data: string[];
  primary: boolean;
}
export interface ACC_IChartItem {
  unit?: string;
  dates: Date[];
  series: ACC_IChartSeriesItem[];
}

export interface ACC_IStrategyDetailItem {
  id: number;
  state: ACC_EStrategyState;
  content: string;
}
export interface ACC_IStrategyItem {
  id: number;
  count: number;
  finished: number;
  time: string;
  type: ACC_EStrategyType;
  details: ACC_IStrategyDetailItem[];
}

export interface ACC_IStrategyProcessDetailItem {
  id: number;
  time: string;
  state: ACC_EStrategyState;
}
export interface ACC_IStrategyProcessItem {
  id: number;
  content: string;
  details: ACC_IStrategyProcessDetailItem[];
}
