export enum CA_EPath {
  根据能源类型查询树模型 = '/admin/tree/listTreeByEnergyCode',
  查询饼状图与表格数据 = '/costAnalyse/queryTreeCostAnalyseVO',
  查询柱状图与各分类分项总能耗数据 = '/costAnalyse/queryEnergyCodeCostAnalyseVO',
  导出成本明细 = '/costAnalyse/exportExcelCostAnalyse',
}

/**
 * 根据能源类型返回颜色
 * @param energy
 * @returns
 */
export const mapEnergyColor = (energy: string): string => {
  let color = '#ccc';
  switch (energy) {
    case '01000':
      color = '#3681FF';
      break;
    case '02000':
      color = '#FF9120';
      break;
    case '03000':
      color = '#FFCB20';
      break;
    case '04000':
      color = '#00B261';
      break;
    case '05000':
      color = '#FE4B4E';
      break;
    default:
      color = '#ccc';
      break;
  }

  return color;
};

// 搜索入参
export interface CA_IQueryParams {
  startTime: string;
  endTime: string;
  treeIdList: number[];
}

/**
 * 接口 [查询柱状图与各分类分项总能耗数据]
 */
export interface CA_IQueryEnergyCodeCostAnalysisVoRes {
  /**
   * 各分类分项总成本
   */
  stripData: CA_IStripDataVO[];
  /**
   * 所有分类分项的总成本
   */
  totalCost: number | null;
  /**
   * 柱状图数据实体
   */
  costBarChartDataVO: CA_IBarChartDataVO;
  /**
   * 成本
   */
  tenThousandCost: number | null;
  /**
   * 单位
   */
  unit: string;
}
// 进度条使用数据
export type CA_IProgressDataVO = Omit<CA_IQueryEnergyCodeCostAnalysisVoRes, 'costBarChartDataVO'>;
// 各分类分项总成本
export interface CA_IStripDataVO {
  /**
   * 分类分项名
   */
  energyName: string;
  /**
   * 分类分项代码
   */
  energyCode: string;
  /**
   * 分类分项下成本列表
   */
  costList: number[];
  /**
   * 分类分项下成本列表(超过万元自动换算)
   */
  tenThousandCostList: string[];
  /**
   * 总成本
   */
  totalCost: number | null;
  /**
   * 成本
   */
  tenThousandCost: number | null;
  /**
   * 单位
   */
  unit: string;
}
// 柱状图数据实体
export interface CA_IBarChartDataVO {
  /**
   * 每个树节点各分类分项成本
   */
  seriesData: CA_IBarChartSeriesDataVO[];
  /**
   * x轴名称
   */
  legendData: string[];
  /**
   * y轴名称
   */
  yaxisData: string[];
}
// 每个树节点各分类分项成本
export interface CA_IBarChartSeriesDataVO {
  /**
   * 分类分项名
   */
  energyName: string;
  /**
   * 分类分项代码
   */
  energyCode: string;
  /**
   * 分类分项下成本列表
   */
  costList: number[];
  /**
   * 分类分项下成本列表(超过万元自动换算)
   */
  tenThousandCostList: string[];
  /**
   * 总成本
   */
  totalCost: number | null;
  /**
   * 成本
   */
  tenThousandCost: number | null;
  /**
   * 单位
   */
  unit: string;
}
/**
 * 接口 [查询饼状图与表格数据]
 */
export interface CA_IQueryTreeCostAnalysisVoRes {
  /**
   * 饼状图数据实体
   */
  costPieChartDataVO: CA_IPieChartDataVO;
  /**
   * 表格数据实体
   */
  tableDataVO: CA_ITableDataVO;
}

// 饼状图数据实体
export interface CA_IPieChartDataVO {
  /**
   * 树节点成本数据
   */
  seriesData: CA_IPieSeriesDataVO[];
  /**
   * 树节点名称
   */
  legendData: string[];
}
export interface CA_IPieSeriesDataVO {
  /**
   * 树节点id
   */
  treeId: number | null;
  /**
   * 树节点名
   */
  treeName: string;
  /**
   * 能耗值
   */
  energyValue: number | null;
  /**
   * 成本
   */
  cost: number | null;
  /**
   * 成本
   */
  tenThousandCost: number | null;
  /**
   * 单位
   */
  unit: string;
}
// 表格数据实体
export interface CA_ITableDataVO {
  /**
   * 每行表格数据
   */
  body: string[][];
  /**
   * 表格列名
   */
  title: string[];
  /**
   * 表格列名
   */
  treeIdList: number[];
}
// 处理成页面需要的格式
export interface CA_IConvertTableDataVO extends Omit<CA_ITableDataVO, 'body'> {
  body: { [key: string]: string }[];
}
