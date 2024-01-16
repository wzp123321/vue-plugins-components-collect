export interface IWeekSummaryData {
  id: number;
  comment: string;
  taskCount: number;
  lastTime: string; // yyyy-MM-dd hh:mm:ss
  serviceDays: number;
  beginTime: string; // yyyy-MM-dd
  endTime: string; // yyyy-MM-dd
  createdTime: string; // yyyy-MM-dd hh:mm:ss
}

export interface IWeekSummaryList {
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
  list: IWeekSummaryData[];
}
