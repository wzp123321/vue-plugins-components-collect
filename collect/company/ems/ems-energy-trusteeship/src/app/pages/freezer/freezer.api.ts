export enum F_EEfficiencyRank {
  A = 1,
  B,
  C,
  D,
}
export const F_EEfficiencyRank_Options = Object.entries(F_EEfficiencyRank)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => ({ label: k, value: v as F_EEfficiencyRank }));
Object.freeze(F_EEfficiencyRank_Options);

export interface F_IQuery {
  nodes: number[];
  begin: Date;
  end: Date;
}

export interface F_IOptionItem<T> {
  label: string;
  value: T;
}

export interface F_IEfficiencyNodeItem {
  id: number;
  name: string;
}

export interface F_IPowerItem {
  average: string;
  min: string;
  max: string;
}

export interface F_IBenchmarkItem {
  level: F_EEfficiencyRank;
  value?: string;
}

export interface F_IParameterItem extends F_IPowerItem {
  index?: number;
  name: string;
}

export interface F_IAnalysisSeriesItem {
  name: string;
  unit?: string;
  data: string[];
}
export interface F_IAnalysisSource {
  dates: Date[];
  series: F_IAnalysisSeriesItem[];
}
