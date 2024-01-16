/**
 * 能耗明细table表
 * @param year 年份
 * @param eventTypeId 能源类型
 * @param pageNum 页码
 * @param pageSize 每页条数
 */
export interface EnergyEventSearchForm extends GeneralModule.CommonQueryParams {
  year: string;
  eventTypeId: string;
  pageNum: number;
  pageSize: number;
}
/**
 * @param eventTitle 事件标题
 * @param eventTypeName 事件类型
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param eventDetail 事件详情
 * @param energyValue 能耗变化量
 * @param energyCost 成本变化
 * @param entryTime 录入时间
 * @param energyValueUnit 能耗变化量单位显示
 * @param tenantName 项目名称
 */
export interface EnergyEventList {
  eventTitle: string;
  eventTypeName: string;
  startTime: string;
  endTime: string;
  eventDetail: string;
  energyValue: string;
  energyCost: string;
  entryTime: string;
  energyValueUnit: string;
  tenantName: string;
}

/**
 * @param eventTypeName 能源事件类型名称
 * @param count 数量
 * @param eventTypeId 能源类型
 * @param active 选中的标记
 */
export interface EnergyEventCard {
  eventTypeName: string;
  count: number;
  eventTypeId: number;
  active?: boolean;
}

/**
 * @param eventTitle 事件标题
 * @param eventTypeName 事件类型
 * @param adjustmentType 调整方式
 * @param startTime 开始时间/原定时间
 * @param endTime 结束时间/调整时间
 * @param entryMode 录入方式
 * @param regions 选择区域
 * @param adjustmentNode 调整节点
 * @param energyInfo 能源数据（能源类型，能源用量）
 * @param changeType 变更性质
 * @param devices 选择设备
 * @param eventDetail 事件详情
 * @param entryPersonnel 录入人员
 * @param tableInfo 能耗明细表
 */
export interface DetailForm {
  eventTitle: string | null;
  eventTypeName: string | null;
  adjustmentType?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  entryMode?: string | null;
  regions?: string | null;
  adjustmentNode?: string | null;
  energyInfo?: {
    [key: string]: string;
  };
  changeType?: string | null;
  devices?: string | null;
  eventDetail: string | null;
  entryPersonnel: string | null;
  tableInfo?: {
    tableNames: string[];
    tableValues: string[];
  };
}
