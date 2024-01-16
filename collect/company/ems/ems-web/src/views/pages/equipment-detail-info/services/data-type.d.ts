declare namespace IEquipmentDetailInfo {
  // 头部表单
  export interface QueryForm {
    queryTime: any | null;
    paramId: number | undefined;
  }
  // 查询参数
  export interface QueryParams {
    startTime: string;
    endTime: string;
    serialNumber: string;
    deviceId: string;
  }
  // 设备详情
  export interface EquipmentInfo {
    address: string;
    havcSystemParamList: ParamInfo[];
    id: number;
    manufactureDate: string;
    manufacturer: string;
    model: string;
    name: string;
    number: string;
    proDeviceTypeName: string;
    ratedPower: string;
    ratedPowerUnit: string;
    status: string;
    system: string;
  }
  // 参数详情
  export interface ParamInfo {
    id: number;
    serialNumber: string;
    name: string;
    unit: string;
  }
  // echart数据
  export interface EquipChartInfo {
    seriesData: number[];
    xaxisTimes: string[];
  }
  // 表格数据
  export interface EquipmentTableInfo {
    havcSystemParamTitleList: string[];
    tableDetailList: string[];
  }
  // 表格拼接
  export interface EquipmentTableDataSource {
    date: string;
    [key: string]: string;
  }
  // 导出入参
  export interface EquipmentExportParams {
    serialNumber: string;
    deviceId: string;
    startTime: string;
    endTime: string;
  }
}
