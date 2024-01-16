declare namespace AnalysisManageModule {
  /**能耗柱状图入参 start */
  interface GetLineBarChartParam {
    endTime: string;
    energyCode: string | array;
    isSelf: boolean;
    startTime: string;
    timeUnit: string | null;
    treeId: number | array;
    standardPointCode?: string;
    valueMean: string;
    type?: number;
    isDevice?: number;
    pointNumber?: number;
  }
  /**能耗柱状图入参 end */
  // 报告导出params
  export interface AnalysisWordExportParams extends GetLineBarChartParam {
    hbPhoto: File;
    piePhoto: File;
    tbPhoto: File;
  }
  export interface AnalysisSearchData extends GetLineBarChartParam {
    model?: string | number;
  }
  /**能耗柱状图返回 start */
  interface LastMonthValue {
    name: string;
    value: number;
  }

  interface LastYearValue {
    name: string;
    value: number;
  }

  interface Value {
    name: string;
    value: number;
  }

  interface BarChartSeriesList {
    analyseObjectId: number;
    analyseObjectName: string;
    colors: any[];
    dataStatus: any[];
    energyType: string;
    lastMonthValues: LastMonthValue[];
    lastYearValues: LastYearValue[];
    values: Value[];
  }

  interface LegendDataList {
    color: string;
    description: string;
  }

  interface YaxisItemList {
    title: string;
    unit: string;
  }

  interface BarChart {
    barChartSeriesList: BarChartSeriesList[];
    legendDataList: LegendDataList[];
    timeUnit: string;
    xaxisTimes: any[];
    yaxisItemList: YaxisItemList[];
  }

  interface EnergyTableList {
    analyseObjectId: number;
    analyseObjectName: string;
    currentEnergyValue: number;
    lastMonthEnergyValue: number;
    lastMonthRatio: number;
    lastYearEnergyValue: number;
    lastYearRatio: number;
    time: string;
    timeRange: string;
  }

  interface GetLineBarChartRes {
    barChart: BarChart;
    colName: string;
    energyTableList: EnergyTableList[];
  }
  /**能耗柱状图返回 end */
  /**能耗数据钻取 start */
  interface DataDrillList {
    analyseObjectId: number;
    analyseObjectName: string;
    currentEnergyValue: number;
    lastMonthEnergyValue: number;
    lastYearTimeInfo: string;
    lastMonthTimeInfo: string;
    lastMonthRatio: number;
    lastYearEnergyValue: number;
    lastYearRatio: number;
    time: string;
  }

  interface AnalyseDataDrillRes {
    dataDrillList: DataDrillList[];
    isLeaf: boolean;
    unit: string;
  }
  /**能耗数据钻取 end */
  /**能耗分解环形图 start */
  interface PieChartDataList {
    id?: number;
    name: string;
    percent?: number;
    value: number;
  }

  interface PieChartSeriesList {
    energyType: string;
    pieChartDataList: PieChartDataList[];
  }

  interface YaxisItemList {
    title: string;
    unit: string;
  }

  interface PieChart {
    pieChartSeriesList: PieChartSeriesList[];
    total: number;
    yaxisItemList: YaxisItemList[];
  }

  interface EnergyAnalysePieChartRes {
    currentTotalEnergyValue: number;
    deviceNumber: number;
    hasDirectDevice: boolean;
    pieChart: PieChart;
    treeName: string;
  }
  /**能耗分解环形图 end */
  /**能耗同环比 start */
  interface GetEnergyCompareParam extends GetLineBarChartParam {
    standardPointCode?: string;
    pointNumber?: number;
  }
  interface EnergyCompareRes {
    analyseObjectId: number;
    analyseObjectName: string;
    averageEnergyValue: number;
    currentEnergyValue: number;
    lastMonthEnergyValue: number;
    lastMonthRatio: number;
    lastYearEnergyValue: number;
    lastYearRatio: number;
    maxEnergyValue: number;
    minEnergyValue: number;
    unit: string;
  }
  /**能耗同环比 end */
  /**设备明细 start*/
  interface IndexDeviceListRes {
    deviceID: number;
    standardPointCode: string;
    deviceName: string;

    energyCode: string;
    energyCodeName: string;
    pointName: string;
    pointNumber: number;
  }
  interface RealtimeRes {
    status: number;
    devNumber: string;
    devType: string;
    category: string;
    nature: string;
    affiliations: string;
    location: string;
    rating: string;
  }
  /**设备明细 end*/
}
