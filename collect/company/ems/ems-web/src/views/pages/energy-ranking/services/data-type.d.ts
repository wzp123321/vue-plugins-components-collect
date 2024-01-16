/** 能耗排名模块 */
declare namespace EnergyRankingModule {
  /**
   * 数据请求传参
   * @param energyCode 能源分类分项编码
   * @param queryFlag 1多对象对应单一时间 2多时间对应单对象 无多对多
   * @param queryTime 	时间列表
   * @param timeUnit 时间颗粒度 0：10m 1：时 2：天 4：月 5：年
   * @param treeIds 分析树节点对象ID
   * @param valueMean 1实际值 2人均 3面均 4标煤 5co2
   */
  interface EnergyRankingQueryParams {
    energyCode: string;
    startTime: string;
    endTime: string;
    treeIdList: number[];
    valueMean: string;
    withCompare: number;
    withCount: number;
  }
  interface EnergyRankingPageForm {
    energyCode: string[];
    date: any[];
    treeIdList: number[];
    valueMean: string;
    dateScope: number;
  }
  /**
   * 能耗排名
   * @param colName 动态表格列名
   * @param energyRankTableVOList 表格数据
   * @param lineChart 折线图数据
   * @param pieChart 饼图数据
   */
  interface EnergyAnalyseRankData {
    colName: string;
    energyRankTableVOList: EnergyRankTableVOList[];
    lineChart: EnergyRankChartDataList;
    pieChart: EnergyRankChartDataList;
  }
  /**
   * 能耗排名表格表格数据
   * @param energyType 能耗类型
   * @param id id
   * @param name 分析对象名字
   * @param order 排序
   * @param percent 占比
   */
  interface EnergyRankTableVOList {
    energyType: string;
    id: number;
    name: string;
    order: number;
    percent: number;
    value: number;
  }
  /**
   * 能耗排名柱状图
   * @param pieChartSeriesList 数据源
   * @param yaxisItemList y轴数据
   * @param total 总数
   */
  interface EnergyRankChartDataList {
    pieChartSeriesList: PieChartSeriesList[];
    yaxisItemList: YaxisItemList[];
    total?: number;
  }
  /**
   * 数据源
   * @param energyType 能耗类型
   * @param pieChartDataList 数据
   */
  interface PieChartSeriesList {
    energyType: string;
    pieChartDataList: PieChartDataList[];
  }
  /**
   * 纵轴
   * @param title 标题
   * @param unit 单位
   */
  interface YaxisItemList {
    title: string | null;
    unit: string;
  }
  /**
   * 能耗排名chart 数据
   * @param id id
   * @param name 分析对象名字
   * @param percent 占比
   * @param value 值
   */
  interface PieChartDataList {
    id: number;
    name: string;
    percent?: number;
    value: number;
  }
  /**
   * 分组下的树列表
   */
  interface GroupRankTree {
    treeId: number;
    name: string;
    groupTreeId: number;
  }
}
