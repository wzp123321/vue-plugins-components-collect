import { ML_EMeasureSystem } from '../measure-library/measure-library.api';

export enum WP_EPlanState {
  全部,
  尚未启动,
  正在执行,
  暂停,
  已完成,
}
export const WP_EPlanState_Options = Object.entries(WP_EPlanState)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WP_EPlanState };
  });
Object.freeze(WP_EPlanState_Options);

export enum WP_EExecutionPeriod {
  '工作日（周一至周五）' = 2,
  每日 = 1,
  每周 = 3,
  每月,
  特殊时间,
}
export const WP_EExecutionPeriod_Options = Object.entries(WP_EExecutionPeriod)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WP_EExecutionPeriod };
  });
Object.freeze(WP_EExecutionPeriod_Options);

export enum WP_ESkipHoliday {
  节假日跳过 = 1,
  节假日计划顺延至下一工作日 = 0,
}
export const WP_ESkipHoliday_Options = Object.entries(WP_ESkipHoliday)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WP_ESkipHoliday };
  });
Object.freeze(WP_ESkipHoliday_Options);

export enum WP_EExecutionType {
  每日执行 = 1,
  持续执行,
}
export const WP_EExecutionType_Options = Object.entries(WP_EExecutionType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WP_EExecutionType };
  });
Object.freeze(WP_EExecutionType_Options);

export enum WP_EWeek {
  周一 = 1,
  周二,
  周三,
  周四,
  周五,
  周六,
  周日,
}
export const WP_EWeek_Options = Object.entries(WP_EWeek)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WP_EWeek };
  });
Object.freeze(WP_EWeek_Options);

export interface WP_IQuery {
  name: string; // 计划名称
  code: string; // 计划编码
  state: WP_EPlanState; // 计划状态
  index?: number; // 分页-页码
  size?: number; // 分页-条目数量
}

export interface WP_IPlanItem {
  readonly id: number;
  readonly index?: number; // 序号
  readonly code: string; // 计划编码
  name: string; // 计划名称
  description: string; // 计划描述
  period: WP_EExecutionPeriod; // 执行周期
  state: WP_EPlanState; // 计划状态
  effectiveTime: string; // 生效时间
  readonly entryTime?: string; // 录入时间
}
export interface WP_IPlanTime {
  readonly id: number;
  begin?: Date | string; // 开始时间
  end?: Date | string; // 结束时间
  execution?: { date: Date }[] | WP_EWeek[]; // 执行时间
  type?: WP_EExecutionType; // 月任务类型
}
export interface WP_IPlanTime_Day extends WP_IPlanTime {
  begin: Date;
  end: Date;
}

export interface WP_IPlanTime_Week extends WP_IPlanTime {
  execution: WP_EWeek[];
}

export interface WP_IPlanTime_Month extends WP_IPlanTime {
  begin: string;
  end: string;
  type: WP_EExecutionType;
}

export interface WP_IPlanTime_Special extends WP_IPlanTime {
  execution: { date: Date }[];
}
export interface WP_IPlanDetail {
  readonly id: number;
  system: ML_EMeasureSystem; // 所属系统
  showSearch?: boolean; // 是否能输入
  measureOptions?: {
    label: string;
    value: number;
    description: string;
    newFlag?: boolean;
  }[]; // 措施列表
  measure: number; // 措施id
  measureName: string; // 措施名
  newFlag?: boolean; // 是否新增
  description: string; // 措施描述
  timesheet: WP_IPlanTime[]; // 执行时间表
}
export interface WP_IPlanInfo {
  readonly id: number;
  readonly code: string; // 计划编码
  name: string; // 计划名称
  description: string; // 计划描述
  period: WP_EExecutionPeriod; // 执行周期
  readonly state: WP_EPlanState; // 计划状态
  holiday: WP_ESkipHoliday; // 节假日处理方式
  dateRange?: [Date, Date]; // 生效时间 -[开始时间，结束时间]
  details: WP_IPlanDetail[]; // 计划细则列表
}
