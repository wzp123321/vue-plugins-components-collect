/** Http请求模块 */
declare namespace benchmarkingDataMaintenanceHttp {
  /** 接口返参 start */
  interface ordersType {
    asc: boolean;
    column: string;
  }
  export interface getListUrlType {
    systemId: number | undefined;
    valueTime: string;
    benchmarkingType: string;
    orders: ordersType[];
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
  }
  export interface deleteUrlType {
    id: number;
  }
  export interface addUrlType {
    benchmarkingIndexId: number | undefined;
    benchmarkingType: string;
    id: number | undefined;
    systemId: number | undefined;
    treeId: number | undefined;
    value: string;
    valueTime: string;
  }
  export interface updateUrlType {
    coolingMode: string;
    general: string;
    heatingMode: string;
    regionType: string;
    systemLevel: string;
    systemName: string;
    systemType: string;
  }

  export interface batchSingleDataDelete {
    idList: any;
    timeType: any;
  }
  // 值差型

  export interface createValueListUrl {
    collectTime: string;
    endValue: any;
    paramId: any;
    remark: string;
    startValue: any;
  }
  export interface batchValueDelete {
    dataIdList: any;
  }
  // 时差型

  export interface batchHourDelete {
    dateIdList: any;
  }
  /** 列表接口响应 */
  interface HttpListResponsive<T> {
    list: T;
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  }
}

/** 定义录入数据页面接口 */
declare namespace benchmarkingDataMaintenance {
  interface formInlineType {
    date: any;
    paramsName: string;
    timeUnit: string;
  }
  interface tableDataType {}
  interface unitArrType {
    timeCode: string;
    timeName: string;
  }
  interface formType {
    paramsName: string | undefined;
    timeUnit: string;
    date: string | Date;
    inputValueTwo?: string | Date;
    inputValueOne?: string | Date;
    dataDesciption: string;
    inputValue?: string;
  }
  /** 头部搜索参数通用 */
  interface SearchParmas {
    energyCode: any[];
    queryTimeList: Array<Date>;
    timeUnit?: number;
    treeIds: string[];
    valueMean: string;
  }
  /** 通用对象 */
  interface CommonObject {
    [key: string]: any;
  }
  /**
   * 通用头部搜索参数
   * @param orders 排序
   * @param pageNum 页码
   * @param pageSize 页数
   * @param searchCount 是否查询total
   */
  /** 通用头部搜索参数 */
  interface CommonSearchParams {
    orders: Array<{
      asc: boolean;
      column: string;
    }>;
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
  }
  /** 字典 */
  interface DictionaryInfo {
    code: string;
    name: string;
  }
  /**
   * 菜单
   */
  interface MenuInfo {
    id: number;
    name: string;
    orderNum: number;
    remark: string;
    type: number;
    url: string;
    childMenu: MenuInfo[];
  }
}
