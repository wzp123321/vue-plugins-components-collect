export enum PARAM_TYPES {
  DEVICE_ACQUISITION = 1, // 设备采集型
  TIMETABLE = 2, // 作息时间
  MANUAL_ENTRY = 3, // 人工录入
  SINGLE_DATA = 4, // 单值累计型
  ARITHMETIC_MEAN = 5, // 单值算数平均型
  DATA_DIFFERENCE = 6, // 值差型
  DATE_DIFFERENCE = 7, // 时差型
}

// 新建参数类型
export enum PARAM_CREATE_TYPE {
  GLOBAL = '1', // 全局
  NODE = '2', // 节点参数
}

// 详情
export interface NodeParameterDetail {
  id: number;
  unit: string;
  name: string;
  paramType: number;
  timeTypes: string;
  standardPointCode: string;
  standardPointName: string;
  treeMap: { [key: number]: { treeIds: number[]; treeNames: string[] } };
  paramId: number;
  energyCode: string;
  treeNames: string[];
  treeId: number;
  typeName: string;
  deviceName: string;
  pointNumber: number;
  deviceId: string;
}
// 表单
export interface NodeParamterForm {
  id?: number;
  name: string;
  unit: string;
  paramType: number[];
  energyCode: string;
  treeIds: number[];
  timeTypes: string[];
  standardPointName: string;
  deviceId: string;
}
// 新增入参
export interface ParameterAddParams extends ParameterCommonParams {}
// 新增入参
export interface ParameterUpdateParams extends ParameterCommonParams {
  paramId: number;
}
// 编辑新增公共入参
export interface ParameterCommonParams {
  unit: string;
  name: string;
  paramType: number;
  code: string;
  timeTypes: string;
  treeIds: number[];
  addDTO: AddDeviceDTO | null;
}
export interface AddDeviceDTO {
  deviceId: number;
  pointNumber: number;
  deviceName: string;
  pointName: string;
}
// 查询入参
export interface ParameterQueryParams extends GlobalModule.CommonSearchParams {
  keyword: string;
}
// 类型
export interface ParameTypeInfo {
  label: string;
  value: number;
  children?: ParameTypeInfo[];
}
