/**
 * 变压器模块
 */
declare namespace TransformerModule {
  interface Id {
    id: number;
    type: string;
  }
  interface QueryParams {
    beginDate: string;
    endDate: string;
    groupFlag: string;
    transObjs: Id[];
    objType: string;
    objectId: number;
    paramId: number;
    timeGranularity: string;
  }
  /**
   * 图标数据
   */
  interface ChartsData {
    legendList: string[];
    timestamp: number[];
    yaxisData: { title: string; unit: string }[];
    seriesData: { paramName: string; showOrder: number; values: number[] }[];
  }
  /**
   * 列表数据
   */
  interface tableData {
    colName: string[];
    tableData: any[];
  }
  /**
   * echart图标模块所需的数据
   */
  interface EchartAndTableData {
    chartsDataVO: ChartsData;
    tableDataVO: tableData;
  }
  /**
   * tables模块所需的数据
   */
  interface AllTableData {
    loadDetailsVO: HttpRequestModule.ResTemplate<LoadOverview>;
    lossRatioDetailsVO: HttpRequestModule.ResTemplate<LossRateOverview>;
    paramLevelLists: HttpRequestModule.ResTemplate<ParamsLevel[]>;
  }
  /**
   * 负荷总览
   */
  interface LoadOverview {
    aveLoadValue: number;
    id: number;
    lastMonthPercentage: string;
    lastMonthValue: number;
    lastMonthRatio: number;
    lastYearPercentage: string;
    lastYearValue: number;
    lastYearRatio: number;
    loadValueUnit: string;
    maxLoadValue: number;
    maxLoadValueTime: string;
    minLoadValue: number;
    minLoadValueTime: string;
    name: string;
    ratedCapacity: number;
    ratedCapacityUnit: string;
  }
  /**
   * 损耗率总览
   */
  interface LossRateOverview {
    aveLossRatioValue: number;
    id: number;
    lastMonthPercentage: string;
    lastMonthValue: number;
    lastMonthRatio: number;
    lastYearPercentage: string;
    lastYearValue: number;
    lastYearRatio: number;
    lossRatioValueUnit: string;
    maxLossRatioValue: number;
    maxLossRatioValueTime: string;
    minLossRatioValue: number;
    minLossRatioValueTime: string;
    name: string;
  }
  /**
   * 参数水平
   */
  interface ParamsLevel {
    paramId: number;
    average: number;
    description: string;
    lowerLimit: number;
    paramName: string;
    paramUnit: string;
    upperLimit: number;
  }
  /**
   * 参数排名
   */
  interface ParamsRank {
    average: number;
    lowerLimit: number;
    paramId: number;
    paramName: string;
    rankingNumber: string;
    rankingObjectId: string;
    rankingObjectName: string;
    upperLimit: number;
    valueUnit: string;
  }
  /**
   * 查询单个变压器返回数据
   */
  interface SingleResponse {
    chartsAndTableVO: HttpRequestModule.ResTemplate<EchartAndTableData>;
    loadDetailsVO: HttpRequestModule.ResTemplate<LoadOverview>;
    lossRatioDetailsVO: HttpRequestModule.ResTemplate<LossRateOverview>;
    paramLevelLists: HttpRequestModule.ResTemplate<ParamsLevel[]>;
  }
  /**
   * 查询多个变压器返回数据
   */
  interface MultiResponse {
    chartsAndTableVO: EchartAndTableData;
    rankList: string[];
  }
  /**
   * 表单数据
   */
  interface FormData {
    date: any[];
    timeUnit: string;
    energyEfficiencySelected: id | number[];
    energyEfficiencySelectedInfo: any[];
  }
  /**
   * 变压器树节点
   */
  interface TreeNode {
    children: TreeNode[];
    groupFlag: string;
    id: number;
    name: string;
  }
  /**
   * 公共参数信息
   */
  interface ParamInfo {
    configId: number;
    objectId: number;
    objectName: string;
    objectType: string;
    lowerLimit: number;
    paramId: number;
    paramName: string;
    unit: string;
    upperLimit: number;
  }
}
