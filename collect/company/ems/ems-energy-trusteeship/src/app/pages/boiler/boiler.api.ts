export enum B_EEfficiencyRank {
  A = 1,
  B,
  C,
}
export const B_EEfficiencyRank_Options = Object.entries(B_EEfficiencyRank)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => ({ label: k, value: v as B_EEfficiencyRank }));
Object.freeze(B_EEfficiencyRank_Options);

export interface B_IQuery {
  nodes: number[];
  begin: Date;
  end: Date;
}

export interface B_IOptionItem<T> {
  label: string;
  value: T;
}

export interface B_IEfficiencyNodeItem {
  id: number;
  name: string;
}

export interface B_IPowerItem {
  average: string;
  min: string;
  max: string;
}

export interface B_EfficiencyItem {
  cost: string;
  output: string;
  consumption: string;
}

export interface B_IBenchmarkItem {
  level: B_EEfficiencyRank;
  value?: string;
}

export interface B_IParameterItem extends B_IPowerItem {
  index?: number;
  name: string;
}

export interface B_IAnalysisSeriesItem {
  name: string;
  unit?: string;
  data: string[];
}
export interface B_IAnalysisSource {
  dates: Date[];
  series: B_IAnalysisSeriesItem[];
}
