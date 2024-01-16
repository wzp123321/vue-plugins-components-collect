declare namespace BenchmarkingDataMaintenance {
  /**
   *查询 体系选择下拉数据
   */
  export interface SystemListUrlParams {
    coolingMode: string;
    general: string;
    heatingMode: string;
    id: number;
    regionType: string;
    systemLevel: string;
    systemName: string;
    systemType: string;
  }
  /**
   * 查询表格数据 入参
   * @param benchmarkingType 数据类型（1：年，2：月）
   * @param endDate 结束时间 年:2022 月:2022-02
   * @param startDate 结束时间 年:2022 月:2022-02
   * @param systemId 	对标对象节点id
   */
  interface ordersType {
    asc: boolean;
    column: string;
  }
  export interface GetListUrlParams {
    benchmarkingType: string;
    endDate: string;
    orders: ordersType[];
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
    startDate: string;
    systemId: number | undefined;
  }

  /**
   * table表格数据，查询接口返回参数
   * @param total 	数量
   * @param benchmarkingDataQueryVO 标头名称
   * @param benchmarkingDataQueryVOList 	指标数据分页列表
   * @param systemId  对标对象id
   * @param systemName 医院名称
   * @param valueDate 	数据时间
   * @param benchmarkingDataValueQueryVOList 指标数据列表
   * @param benchmarkingIndexId 指标id
   * @param benchmarkingType 数据类型（1：月，2：年）
   * @param value 指标名称或值
   * @param valueTime 指标值时间
   */
  export interface TableDataSourceVO {
    total: number;
    benchmarkingDataQueryVO: BenchmarkingDataQueryVOType;
    benchmarkingDataQueryVOList: BenchmarkingDataQueryVOType[];
  }

  export interface BenchmarkingDataQueryVOType {
    systemId: number;
    systemName: string;
    valueDate: string;
    benchmarkingDataValueQueryVOList: BenchmarkingDataValueQueryVOListType[];
  }

  export interface BenchmarkingDataValueQueryVOListType {
    id: number;
    systemId: number;
    benchmarkingIndexId: number;
    benchmarkingType: number;
    value: string;
    valueTime: string;
    isInputHidden?: boolean;
  }

  export interface QuotaType {
    label: string;
    value: string;
  }

  /**
   * 编辑 入参
   * @param benchmarkingIndexId 指标id
   * @param benchmarkingType 	数据类型（1：月，2：年）
   * @param systemId 	对标对象节点id
   * @param value 指标值
   * @param valueTime  指标值时间
   */
  export interface CreateBenchmarkingDataParams {
    benchmarkingIndexId: number;
    benchmarkingType: string;
    id: number | null;
    systemId: number;
    value: number | string | null;
    valueTime: string;
  }

  export interface FileType {
    lastModified: number;
    lastModifiedDate: any;
    name: string;
    size: number;
    type: string;
    webkitRelativePath: string;
  }

  /**
   * 导入异常返回数据
   */
  export interface errorDataListType {
    detail: string;
    position: string;
  }
}
