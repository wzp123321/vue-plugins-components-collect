/** 对标库 */
declare namespace BenchmarkingLibraryModule {
  /**
   * 头部参数
   */
  export interface FormParams {
    type: number;
    treeId: number | undefined;
    benchmarkingType: string;
    yearOrMonth: string | Date;
    dimensionList: [];
  }
  // 对标对象查询返回参数
  export interface BenchmarkingObjectList {
    treeId: number | undefined;
    systemId: number;
    treeLevel: number;
    name: string;
    benchmarkingDataValueQueryVOList: [];
  }
  // 对标库List入参
  export interface BenchmarkingLibraryQueryParams {
    benchmarkingType: string;
    dimensionList: [];
    treeId: number | undefined;
    type: number;
    yearOrMonth: string;
  }
  // 对标库List返回参数
  export interface BenchmarkingLibraryParams {
    benchmarkingDetailsVOList: [];
    benchmarkingResultVOList: [];
    count: number;
  }

  //
  export interface benchmarkingDetailsVOListType {
    averageValue: number;
    benchmarkingIndexId: number;
    benchmarkingIndexName: string;
  }
  // 对标结果
  export interface BenchmarkingResultVOList {
    name: string;
    status: number;
  }
  // 对标详情
  export interface BenchmarkingDetailsVOList {
    averageValue: number;
    benchmarkingIndexId: number;
    benchmarkingIndexName: string;
    benchmarkingIndexUnit: string;
    maxValue: number | null;
    measureValue: number;
    medianValue: number | null;
    minValue: number | null;
    status: number;
  }
  /**z
   * 图表说明
   */
  export interface ChartExplainInfo {
    benchmarkingDetailsVOList: BenchmarkingDetailsVOList[];
    benchmarkingResultVOList: BenchmarkingResultVOList[];
    count: number;
  }

  /**
   *
   */
  /** 通用对象 */
  interface CommonObject {
    [key: string]: any;
  }
}
