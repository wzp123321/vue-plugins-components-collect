export enum WR_EWeek {
  周一 = 1,
  周二,
  周三,
  周四,
  周五,
  周六,
  周日 = 0,
}
export const WR_EWeek_Options = Object.entries(WR_EWeek)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WR_EWeek };
  });
Object.freeze(WR_EWeek_Options);

export enum WR_EWorkState {
  未完成,
  完成,
  延时完成,
  待执行,
}
export const WR_EWorkState_Options = Object.entries(WR_EWorkState)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v]) => {
    return { label: k, value: v as WR_EWorkState };
  });
Object.freeze(WR_EWorkState_Options);

export interface WR_IWorkPreview {
  readonly date: Date; // 日期
  readonly planned?: boolean; // 是否存在工作记录
  readonly score?: number; // 工作得分
}

export interface WR_IWorkItem {
  readonly id: number;
  readonly code: string; // 计划编码
  readonly name: string; // 措施名称
  readonly description?: string; // 措施描述
  readonly state: WR_EWorkState; // 完成状态
  readonly begin?: Date; // 开始时间
  readonly end?: Date; // 结束时间
  readonly deadline?: Date; // 截止时间
  readonly finish?: Date; // 完成时间
  readonly remark?: string; // 完成情况描述
  readonly attaches?: string[]; // 附件图片
}
export interface WR_IWorkList {
  readonly score?: number; // 得分
  readonly daily: WR_IWorkItem[]; // 每日、工作日任务
  readonly weekly: WR_IWorkItem[]; // 周任务
  readonly monthly: WR_IWorkItem[]; // 月任务
  readonly special: WR_IWorkItem[]; // 特殊任务
  readonly other: WR_IWorkItem[]; // 其它任务
}
