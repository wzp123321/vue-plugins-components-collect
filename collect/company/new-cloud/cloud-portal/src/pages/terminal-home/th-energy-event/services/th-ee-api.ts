/**
 * 能源事件
 * @param index 序号
 * @param eventTitle 事件名称
 * @param eventTypeName 事件类型名称
 * @param energyValue 能耗变化量
 * @param evengyCost 成本变化
 * @param entryTime 录入时间
 */
export interface EnergyEventVO {
  readonly index: number;
  readonly eventTitle: string;
  readonly eventTypeName: string;
  readonly energyValue: number;
  readonly energyCost: number;
  readonly entryTime: string;
}

/**
 * 能源事件
 * @param status 状态
 */
export interface EnergyEventInfo extends EnergyEventVO {
  readonly status: number;
}

export interface IEventRes {
  energyEventList: EnergyEventVO[];
  costUnit: string;
  energyUnit: string;
  url: string;
}
