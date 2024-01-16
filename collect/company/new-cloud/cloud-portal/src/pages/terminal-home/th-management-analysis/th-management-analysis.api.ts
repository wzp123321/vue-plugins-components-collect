import { TH_IModule } from '../terminal-home.api';

export const enum TH_MA_EClassification {
  电 = '01000',
  水 = '02000',
  燃气 = '03000',
  蒸汽 = '20000',
}

export interface TH_MA_IStatistic {
  value: number; // 数值
  unit: string; // 单位
}
export interface TH_MA_IClassification {
  code: string; // 分项编码
  name: string; // 分项名称
  benchmark: number; // 基准值
  value: number; // 实际值
  unit: string; // 单位
}
export interface TH_MA_IModule extends TH_IModule {
  surplus: TH_MA_IStatistic; // 盈余
  saving: TH_MA_IStatistic; // 节能率
  list: Array<TH_MA_IClassification>; // 分项列表
}
