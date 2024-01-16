export interface EMWorkItem {
  description: string;
  status: string;
  statusText: string;
  dailyWorkId: number;
  detailId: number;
  remarks?: any;
  attach?: string;
  endTime?: string;
  workStatus?: EMWorkStatus;
  beginTime?: string;
  finishTime: string;
  attachList?: any;
  createdTime?: string;
  measureName: string;
  planCode: string;
  timeRange?: any;
  executionCycle: string;
  relatedFunc?: string;
  createTime?: string;
  deadline?: string;
}

export interface EMOtherWorks {
  count: number;
  workList: EMWorkItem[];
}

export interface EMPlanList {
  count: number;
  monthlyWorks: EMWorkItem[];
  specialWorks: EMWorkItem[];
  weeklyWorks: EMWorkItem[];
  dailyWorks: EMWorkItem[];
}

export type EMStatus = '按时完成' | '未完成' | '延时完成';

export type EMPeriodWorkType = '周' | '月' | '特';

export enum EMWorkStatus {
  未完成,
  按时完成,
  延时完成,
}

export enum EMWorkTimeType {
  history = -1,
  today,
  future,
}
// undone 未完成 done 按时完成 delay 延时完成 todo 月持续任务的待执行
export type EMCheckStatus = 'undone' | 'done' | 'delay' | 'todo' | 'continue' | null;
