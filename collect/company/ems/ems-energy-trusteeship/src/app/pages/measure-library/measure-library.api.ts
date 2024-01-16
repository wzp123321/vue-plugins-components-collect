export enum ML_EMeasureSystem {
  全部,
  暖通,
  能源管理系统,
  综合监控系统,
  其他,
}
export const ML_EMeasureSystem_Options = Object.entries(ML_EMeasureSystem)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as ML_EMeasureSystem };
  });
Object.freeze(ML_EMeasureSystem_Options);

export enum ML_EMeasureState {
  全部,
  有效,
  无效,
}
export const ML_EMeasureState_Options = Object.entries(ML_EMeasureState)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as ML_EMeasureState };
  });
Object.freeze(ML_EMeasureState_Options);

export enum ML_EExecutionPeriod {
  '工作日（周一至周五）' = 2,
  每日 = 1,
  每周 = 3,
  每月,
  特殊时间,
}
export const ML_EExecutionPeriod_Options = Object.entries(ML_EExecutionPeriod)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as ML_EExecutionPeriod };
  });
Object.freeze(ML_EExecutionPeriod_Options);

export enum ML_ERelatedFunction {
  // 能耗分析 = 1,
  // 能耗纵览,
  // KPI管理,
  能耗告警 = 4,
  人工录入,
}
export const ML_ERelatedFunction_Options = Object.entries(ML_ERelatedFunction)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as ML_ERelatedFunction };
  });
Object.freeze(ML_ERelatedFunction_Options);

export enum ML_EMeasureOrigin {
  人工录入 = 1,
  批量导入,
  app录入,
}
export const ML_EMeasureOrigin_Options = Object.entries(ML_EMeasureOrigin)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as ML_EMeasureOrigin };
  });
Object.freeze(ML_EMeasureOrigin_Options);

export interface ML_IQuery {
  name: string; // 措施名称
  code: string; // 措施编码
  system: ML_EMeasureSystem; // 所属系统
  state: ML_EMeasureState; // 措施状态
  index?: number; // 分页-页码
  size?: number; // 分页-条目数量
}

export interface ML_IMeasureItem {
  readonly id: number;
  readonly index?: number; // 序号
  readonly code: string; // 措施编码
  name: string; // 措施名称
  description: string; // 措施描述
  system: ML_EMeasureSystem; // 所属系统
  period: ML_EExecutionPeriod; // 建议执行周期
  state: ML_EMeasureState; // 措施状态
  relation: ML_ERelatedFunction; // 关联功能
  readonly origin?: ML_EMeasureOrigin; // 措施来源
  readonly entryTime?: string; // 录入时间
  readonly canDelete?: boolean;
}
