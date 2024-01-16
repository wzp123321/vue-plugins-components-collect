declare namespace RelationAnalysisModule {
  // 表单
  export interface RelationAnalysisQueryForm {
    date: Date[];
    energyCode: string[];
    treeId: number[];
  }
  // 请求入参
  export interface RelationAnalysisQueryParams {
    browserParamList: RealtionAnalysisParamInfo[] | null;
    correlationStatus: string;
    endTime: string;
    energyCode: string;
    isSelf: boolean;
    startTime: string;
    timeUnit: string;
    treeId: number;
    type: number;
    valueMean: number;
  }
  // 参数
  export interface RealtionAnalysisParamInfo {
    index?: number;
    paramName: string;
  }
  // 关联分析详情
  export interface RelationAnalysisInfo {
    barChartShowVO: BarChartShowVO[];
    barChartVO: RelationAnalysisChartVO;
    correlationValueList: RelationAnalysisParamVO[];
    paramNames: string[];
    tableVOList: RelationAnalysisTableVO[];
    unitList: UnitVo[];
  }
  // 图表
  export interface BarChartShowVO {
    xaxisTime: string;
    yaxisVOList: YaxisVOList[];
  }
  // y轴
  export interface YaxisVOList {
    index: number;
    title: string;
    unit: string;
    yaxisValue: number;
  }
  // 图表数据
  export interface RelationAnalysisChartVO {
    series: SeriesVO[];
    timeUnit: string;
    xaxisTimes: number[];
    yaxisItemList: YaxisItem[];
  }
  // 数据源
  export interface SeriesVO {
    data: number[];
    markPoint: MarkPoint[];
    name: string;
    type: string;
    yaxis: number;
  }
  // 最大最小标记
  export interface MarkPoint {
    difference: number;
    time: string;
    xaxis: number;
    yaxis: number[];
  }
  // y轴
  export interface YaxisItem {
    title: string;
    unit: string;
  }
  // 表格数据
  export interface RelationAnalysisTableVO {
    colValueList: number[];
    xaxisTime: string;
  }
  // 关联参数
  export interface RelationAnalysisParamVO {
    advise: string;
    coefficient: number;
    isRed: boolean;
    paramName: string;
    parentName: string;
    remark: string;
  }
  // 单位
  export interface UnitVo {
    label: string;
    value: string;
  }
}
