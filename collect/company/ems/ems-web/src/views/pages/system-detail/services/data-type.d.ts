// 系统明细
declare namespace ISystemDetail {
  // 表单
  export interface QueryForm {
    systemId: number | undefined;
    systemName: string;
    date: any | null;
    paramId: number | undefined;
    paramName: string;
    serialNumber: string;
    paramUnit: string;
  }
  // 查询入参
  export interface QueryParams {
    startDate: string;
    endDate: string;
    serialNumber: string;
    systemId: number;
  }
  // 系统列表
  export interface SystemInfo {
    id: number;
    level: string;
    name: string;
    parentId: number;
    parentName: string;
    systemType: string;
  }
  // 参数详情
  export interface SystemParamInfo {
    formulaRemark: string;
    formulaRule: string;
    id: number;
    name: string;
    remark: string;
    serialNumber: string;
    unit: string;
  }
  // chart数据
  export interface SystemChartVO {
    timeList: string[];
    valueList: string[];
  }
  // 表格数据
  export interface SystemTableVO {
    proSystemParamTitleList: string[];
    proSystemParamValueList: string[][];
  }
  // 导出参数
  export interface SystemExportParam {
    endDate: string;
    startDate: string;
    systemId: number;
    systemName: string;
    systemType: string;
  }
}
