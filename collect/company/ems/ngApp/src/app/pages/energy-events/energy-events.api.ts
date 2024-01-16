type TAdd = '1'; // 变更性质-新增
type TReduce = '2'; // 变更性质-减少
type TRebuilding = '3'; // 变更性质-改造
export type TPowerDeviceChange = TAdd | TReduce | TRebuilding;
export enum EChangeType {
  Add = '1', // 变更性质-新增
  Reduce = '2', // 变更性质-减少
  Rebuilding = '3,', // 变更性质-改造
}

type TBinding = '1'; // 录入方式-绑定
type TManual = '2'; // 录入方式-人工录入
export type TEntryMode = TBinding | TManual;
export enum EEntryMode {
  Binding = '1', // 录入方式-绑定
  Manual = '2', // 录入方式-人工录入
}

type TAheadStarting = '1'; // 改造方式-提前开
type TDelayClosing = '2'; // 改造方式-推迟关
export type TAirConditionAdjustment = TAheadStarting | TDelayClosing;
export enum EAdjustmentType {
  AheadStarting = '1', // 改造方式-提前开
  DelayClosing = '2', // 改造方式-推迟关
}

export type TEnergyEvent =
  | IEnergyConsumptionAreaChangeEvent
  | IPowerDeviceChangeEvent
  | IRegionalBusinessAdjustmentEvent
  | IAirConditionSupplyAdjustmentEvent
  | IExtraEvent;
export enum EEnergyEvent {
  EnergyConsumptionAreaChangeEvent = 2,
  PowerDeviceChangeEvent = 3,
  RegionalBusinessAdjustmentEvent = 5,
  AirConditionSupplyAdjustmentEvent = 6,
  ExtraEvent = 7,
}

export interface IEventType {
  id: number;
  eventTypeName: string;
}

export interface IEnergyCode {
  code: string;
  unit: string;
  name: string;
  id?: number;
  parentCode?: string;
  parentName?: string;
  treeLeaf?: string;
  moneyRatio?: number;
  coalRatio?: number;
  co2Ratio?: number;
  treeSort?: number;
  totalEnergyFlag?: string;
  standardPoints?: string;
  energyFlag?: string;
  environmentFlag?: string;
}

export interface IRelationData {
  energyCode: string;
  energyCodeUnit?: string;
  codeValue: number;
  energyCodeName: string;
}

interface IBasicEvent {
  id: number;
  eventTypeId: number;
  eventTitle: string;
  startTime: string;
  endTime?: string;
  eventDetail?: string;
  filePaths?: upladImageType[];
  entryPersonnel?: string;
  addFileIdList?: number[];
}

export interface upladImageType {
  fileId: number;
  fileName?: string;
  fileUrl: string;
  imgFlag?: true;
  addrUrl?: string;
}

/**
 * 用能区域变化
 */
export interface IEnergyConsumptionAreaChangeEvent extends IBasicEvent {
  energyObjects: string;
}

/**
 * 大功率用能设备变化
 */
export interface IPowerDeviceChangeEvent extends IBasicEvent {
  entryMode: TEntryMode;
  energyObjects?: string;
  relationData?: IRelationData[];
  changeType: TPowerDeviceChange;
  deleteFileIdList?: string[];
}

/**
 * 区域业务调整
 */
export interface IRegionalBusinessAdjustmentEvent extends IBasicEvent {
  entryMode: TEntryMode;
  energyObjects?: string;
  relationData?: IRelationData[];
}

/**
 * 空调供应时间调整
 */
export interface IAirConditionSupplyAdjustmentEvent extends IBasicEvent {
  entryMode: TEntryMode;
  energyObjects?: string;
  relationData?: IRelationData[];
  adjustmentType: TAirConditionAdjustment;
}

/**
 * 其它因素
 */
export interface IExtraEvent extends IBasicEvent {
  relationData: IRelationData[];
}

//#region 保存参数类型
export interface SaveType {
  adjustmentType?: string;
  changeType?: string;
  deleteFileIdList?: number[];
  endTime?: string;
  energyObjects?: string;
  entryMode?: string;
  eventDetail?: string;
  eventTitle?: string;
  eventTypeId?: number;
  id?: number;
  relationData?: relationDataType[];
  startTime: string;
}
export interface relationDataType {
  codeValue: number;
  energyCode: string;
  energyCodeName: string;
  energyCodeUnit: string;
}
//#endregion
