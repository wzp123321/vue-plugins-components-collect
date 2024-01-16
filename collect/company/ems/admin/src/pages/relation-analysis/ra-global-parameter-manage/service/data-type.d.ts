declare namespace GlobalParameterManage {
  // 详情
  export interface RelationParamterDetail {
    id: number;
    unit: string;
    name: string;
    paramType: number;
    timeTypes: string;
    standardPointCode: string;
    standardPointName: string;
    typeName: string;
    energyCode: string;
    deviceId: string;
    pointNumber: number;
  }
  // 表单
  export interface RelationParamterForm {
    id?: number;
    name: string;
    unit: string;
    paramTypes: number[];
    standardPointName: string;
    energyCode: string;
    timeTypes: string[];
    deviceId: string;
  }
  // 新增入参
  export interface ParameterAddParams extends ParameterCommonParams {}
  // 新增入参
  export interface ParameterUpdateParams extends ParameterCommonParams {
    id: number;
  }
  // 编辑新增公共入参
  export interface ParameterCommonParams {
    unit: string;
    name: string;
    paramType: number;
    code: string;
    timeTypes: string;
    addDTO: NodeParameterManage.AddDeviceDTO | null;
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
}
