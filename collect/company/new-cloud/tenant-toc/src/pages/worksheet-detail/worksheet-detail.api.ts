export enum TT_EName {
  报修 = 'REPAIRS',
  巡检 = 'INSPECTION',
  保养 = 'MAINTAIN',
}

export interface TResWorksheetrObj {
  workOrderType: string; // 工单类型
  totalNum: number; // 工单总数
  averageFinishedRate: number; // 平均完成率
  averageTakeOrderTime: number; // 平均接单时间
  averageFinishedTime: number; // 平均工时
  timelyRate: number; // 及时率
}

export interface TResWorksheetChart {
  domainName: string; // 设备名称
  finishedNum: number; // 已完成
  totalNum: number; // 未完成
}
