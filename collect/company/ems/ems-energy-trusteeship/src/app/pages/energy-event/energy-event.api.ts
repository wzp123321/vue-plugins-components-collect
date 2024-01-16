export const EE_COLORS = [
  'rgba(237, 195, 40, 1)',
  'rgba(77, 189, 203, 1)',
  'rgba(242, 129, 89, 1)',
  'rgba(241, 150, 253, 1)',
  'rgba(94, 191, 127, 1)',
  'rgba(251, 158, 3, 1)',
  'rgba(98, 132, 202, 1)',
];

export enum EE_EAreaTreeType {
  区域 = 1,
  业态,
}
export const EE_EAreaTreeType_Options = Object.entries(EE_EAreaTreeType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EAreaTreeType };
  });
Object.freeze(EE_EAreaTreeType_Options);

export enum EE_EEventType {
  能源单价调整 = 1,
  用能区域变化,
  大功率用能设备变更,
  综合业务量变化,
  区域业务调整,
  空调供应时段调整,
  其他调整,
}
export const EE_EEventType_Options = Object.entries(EE_EEventType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EEventType, color: EE_COLORS[i] };
  });
Object.freeze(EE_EEventType_Options);

export enum EE_EChangeType {
  新增 = 1,
  减少,
  改造,
}
export const EE_EChangeType_Options = Object.entries(EE_EChangeType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EChangeType };
  });
Object.freeze(EE_EChangeType_Options);

export enum EE_EAdjustType {
  提早开 = 1,
  推迟关,
}
export const EE_EAdjustType_Options = Object.entries(EE_EAdjustType)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EAdjustType };
  });
Object.freeze(EE_EAdjustType_Options);

export enum EE_EEquipmentEntryMode {
  绑定设备 = 1,
  人工录入,
}
export const EE_EEquipmentEntryMode_Options = Object.entries(
  EE_EEquipmentEntryMode
)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EEquipmentEntryMode };
  });
Object.freeze(EE_EEquipmentEntryMode_Options);

export enum EE_EAreaEntryMode {
  选择区域 = 1,
  人工录入,
}
export const EE_EAreaEntryMode_Options = Object.entries(EE_EAreaEntryMode)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_EAreaEntryMode };
  });
Object.freeze(EE_EAreaEntryMode_Options);

export enum EE_ENodeEntryMode {
  绑定能耗节点 = 1,
  人工录入,
}
export const EE_ENodeEntryMode_Options = Object.entries(EE_ENodeEntryMode)
  .filter(([k, v]) => typeof v === 'number')
  .map(([k, v], i) => {
    return { label: k, value: v as EE_ENodeEntryMode };
  });
Object.freeze(EE_ENodeEntryMode_Options);

export interface EE_IClassificationItem {
  id: number;
  code: string; // 分项编码
  name: string; // 分项名称
  unit: string; // 分项单位
}

export interface EE_IQuery {
  date: Date; // 事件年份
  type?: EE_EEventType; // 事件类型
  index?: number; // 分页-页码
  size?: number; // 分页-条目数量
}

export interface EE_IChartEventItem {
  type: EE_EEventType; // 事件类型
  value: number; // 能耗值
  title: string; // 事件标题
  description?: string; // 事件详情
}

export interface EE_ICardItem {
  count: number; // 事件计数
  consumption?: string; // 能耗变化
  cost?: string; // 成本变化
}

export interface EE_IEventItem {
  readonly id: number;
  readonly index?: number; // 序号
  title: string; // 事件标题
  type: EE_EEventType; // 事件类型
  begin?: Date; // 开始时间
  end?: Date; // 结束时间
  originalTime?: Date; // 原定时间
  adjustTime?: Date; // 调整时间
  description?: string; // 事件详情
  consumption?: string; // 能耗变化
  cost?: string; // 成本变化
  readonly entryTime?: string; // 录入时间
}

export interface EE_IAttachItem {
  id?: number;
  name: string; // 附件名称
  src?: string; // 附件路径
  file?: File; // 文件域
}

export interface EE_IRelationItem {
  code: string; // 分项编码
  name?: string; // 分项名称
  value: string; // 分项用量
  unit?: string; // 分项单位
}

export interface EE_IEventBaseInfo {
  readonly id?: number;
  type: EE_EEventType; // 事件类型
  title: string; // 事件标题
  photos?: EE_IAttachItem[]; // 附件照片
  files?: EE_IAttachItem[]; // 附件文件
  description?: string; // 事件详情
  deleteAttaches?: number[]; // 删除附件id列表
}

export interface EE_IRelationInfo {
  boundaryId: string; // 异常id
  eventId: number; // 事件id
}

export interface EE_IEventAdditionInfo {
  event: EE_EEventType; // 事件类型
  from: Date; // 开始时间|原定时间
  to?: Date; // 结束时间|调整时间
  type?: EE_EChangeType | EE_EAdjustType; // 变更性质|调整方式
  mode?: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode; // 录入方式
  id?: string; // 所选区域|设备|节点的id
  ids?: string[]; // 所选区域|设备|节点的id集合
  relations?: EE_IRelationItem[]; // 关联数据
}
export interface EE_IEventAdditionInfo_Area extends EE_IEventAdditionInfo {
  event: EE_EEventType.用能区域变化;
}
export interface EE_IEventAdditionInfo_Equipment extends EE_IEventAdditionInfo {
  event: EE_EEventType.大功率用能设备变更;
  type: EE_EChangeType; // 变更性质 1-新增、2-减少、3-改造
  mode: EE_EEquipmentEntryMode; // 录入方式 1-绑定设备、2-人工录入
}
export interface EE_IEventAdditionInfo_Business extends EE_IEventAdditionInfo {
  event: EE_EEventType.区域业务调整;
  mode: EE_EAreaEntryMode; // 录入方式 1-选择区域、2-人工录入
}
export interface EE_IEventAdditionInfo_Conditioner
  extends EE_IEventAdditionInfo {
  event: EE_EEventType.空调供应时段调整;
  type: EE_EAdjustType; // 调整方式 1-提早开、2-推迟关
  mode: EE_ENodeEntryMode; // 录入方式 1-绑定能耗节点、2-人工录入
}
export interface EE_IEventAdditionInfo_Other extends EE_IEventAdditionInfo {
  event: EE_EEventType.其他调整;
}

export interface EE_IDetailInfo extends EE_IEventBaseInfo {
  person?: string;

  from: string;
  to?: string;
  mode?: EE_EEquipmentEntryMode | EE_EAreaEntryMode | EE_ENodeEntryMode;
  select?: string;
  relations?: { name: string; value: string }[];
  changeType?: EE_EChangeType;
  adjustType?: EE_EAdjustType;
}

export interface EE_IDetailTable {
  readonly header: string[];
  readonly body: string[][];
}
