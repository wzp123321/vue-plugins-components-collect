/**
 * 头部面板数据
 */
export interface Ea_IPanelForm {
  treeId: number | null;
  treeType: string;
  energyCode: string;
  timeUnit: string;
  treeName: string;
  parentNames: string;
  date: string;
  energyName: string;
  energyUnit: string;
}

/**
 * 能耗分析查询接口入参
 */
export interface Ea_ISearchParams
  extends Omit<Ea_IPanelForm, 'treeName' | 'parentNames' | 'date' | 'energyName' | 'energyUnit'> {
  /**
   * 查询开始时间 yyyy-MM-dd HH:MM
   */
  startTime: string;
  /**
   * 查询结束时间 yyyy-MM-dd HH:MM
   */
  endTime: string;
}

/**
 * 接口响应结果
 */
export interface Ea_IAnalysisRes {
  totalItem: Ea_IAnalysisTotalVO;
  chartItem: Ea_IChartVO;
}

/**
 * 详情
 */
export interface Ea_IAnalysisTotalVO {
  /**
   * 时间戳
   */
  timeStamp: number | null;
  /**
   * 能耗值
   */
  energyValue: number | null;
  /**
   * 同比值
   */
  lastYearValue: number | null;
  /**
   * 环比值
   */
  lastMonthValue: number | null;
  /**
   * 环比值
   */
  lastMonthRatio: number | null;
  /**
   * 同比值
   */
  lastYearRatio: number | null;
}

/**
 * 图表数据
 */
export interface Ea_IChartVO {
  /**
   * 单位
   */
  unit: string;
  /**
   * 图表名称
   */
  title: string;
  /**
   * 图表项
   */
  itemList: Ea_IAnalysisTotalVO[];
}

/**
 * 节点选择
 */
export interface Ea_ISubmitParams {
  treeType: string;
  treeId: number;
  energyCode: string;
  treeName: string;
  treeNames: string;
}
