/** Http请求模块 */
declare namespace IndicatorDataMaintenance {
  /** 接口返参 start */
  export interface queryTreeDataType {
    nodeType: string | number;
    valueTime: any;
  }
  export interface queryDepartmentTreeDataType {
    valueTime: string;
    treeType: string;
    parentId: number;
    level: number;
  }
  export interface saveDataType {
    correlationIndexId: number | string;
    id: number | string;
    treeId: number | string;
    value: number | string;
    valueTime: any;
  }
}
