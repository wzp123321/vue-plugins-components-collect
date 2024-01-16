export interface MA_AD_ISelectOption {
  label: string;
  value: string;
}

export interface MA_AD_IExceptionItem {
  position: string;
  detail: string;
}

interface MA_AD_IDetailItem {
  name?: string;
  unit?: string;
  values: string[];
}
export interface MA_AD_IEnergyItem {
  energyName: string; // 能源名称
  rowSpan:number;
  amount?: MA_AD_IDetailItem; // 能耗量 | 节能量
  price?: MA_AD_IDetailItem; // 单价
  cost: MA_AD_IDetailItem; // 单项能耗费用 | 节约费用
}
export interface MA_AD_INormalItem extends MA_AD_IDetailItem {
  itemName?: string;
}
export interface MA_AD_IProjectItem {
  projectName: string; // 项目名称
  energyList?: Array<MA_AD_IEnergyItem>;
  otherList?: Array<MA_AD_INormalItem>;
  total?: MA_AD_INormalItem;
}
