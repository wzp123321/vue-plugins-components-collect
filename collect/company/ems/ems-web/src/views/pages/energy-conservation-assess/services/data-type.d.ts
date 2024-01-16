/** 节能考核模块  */
declare namespace EnergyConservationAssess {
  /**
   * 请求参数类型---通用
   * @param energyCode 能耗类型
   * @param quotaDate 定额日期
   * @param quotaType 定额类型
   */
  interface QueryParams {
    energyCode: string;
    quotaDate: string;
    quotaType: number;
  }
  /**
   * 头部参数
   * @param treeIds 分析对象
   */
  interface EnergyConservationHeaderParams extends QueryParams {
    treeIds: string[];
  }
  /**
   * 请求考核数据
   * @param treeId 树节点
   */
  interface QueryDataParams extends QueryParams {
    treeId: string;
  }
  /**
   * 请求树
   * @param treeType 类型
   */
  interface QueryTreeParams extends QueryParams {
    treeType: number;
  }
  /**
   * 节能考核数据
   * @param conclusion 状态
   * @param quotaBalance 每日消耗分析
   * @param trendAnalysis 趋势分析
   * @param usageProgress 进度条
   */
  interface EnergyConservationAssessInfo {
    conclusion: Conclusion;
    quotaBalance: QuotaBalance;
    trendAnalysis: TrendAnalysis;
    usageProgress: UsageProgress;
  }
  /**
   * 消耗统计
   * @param consumeStatistics 消耗统计数组
   * @param proposeInfo 建议
   */
  interface Conclusion {
    consumeStatistics: ConsumeStatistics[];
    proposeInfo: string;
  }
  /**
   * 消耗统计
   * @param isWarning 是否警告
   * @param subjectState 状态
   * @param subjectTitle 标题
   * @param subjectUnit 单位
   * @param subjectValue 值
   * @param value 值
   */
  interface ConsumeStatistics {
    isWarning: boolean;
    subjectState: string;
    subjectTitle: string;
    subjectUnit: string;
    subjectValue: string;
    value: number;
  }
  /**
   * 每日定额分析&&趋势分析数据
   * @param legendData 图例
   * @param quotaType 定额类型
   * @param selectYear 年
   * @param seriesData 数据源
   * @param unit 单位
   * @param xaxisData x轴
   * @param yunit y单位
   */
  interface QuotaBalance {
    legendData: [];
    quotaType: number;
    selectYear: number;
    seriesData: SeriesData[];
    unit: string;
    xaxisData: [];
    yunit: string;
  }
  /**
   * 折线图数据
   * @param data 数据列表
   * @param dataThousand 数据处理列表 整数部分没三位数用,隔开
   * @param name 名称
   * @param smooth 是否连续
   * @param type 数据类型
   */
  interface SeriesData {
    data: number[];
    dataThousand: [];
    name: string;
    smooth: boolean;
    type: string;
  }
  /**
   * 使用进度
   * @param benchTitle 标题
   * @param benchUnit 单位
   * @param benchValue 值
   * @param consume 消耗值
   * @param endTitle 结尾标题
   * @param ideal 理想值
   * @param isHistoryDate
   * @param quota 定额值
   * @param startTitle 开始标题
   */
  interface UsageProgress {
    benchTitle: string;
    benchUnit: string;
    benchValue: string;
    consume: UsageProgressItem;
    endTitle: string;
    ideal: UsageProgressItem;
    isHistoryDate: boolean;
    quota: UsageProgressItem;
    startTitle: string;
  }
  /**
   * progress 数据
   * @param itemDay 日期
   * @param itemTitle 标题
   * @param itemValue 值
   * @param itemValueThousand 处理千分后的值
   * @param percnet 占比
   * @param unit 单位
   */
  interface UsageProgressItem {
    itemDay: string;
    itemTitle: string;
    itemValue: number;
    itemValueThousand: string;
    percnet: number;
    unit: string;
  }
  interface KpiTree {
    kpiTreeList: TreeDetail[];
    clickTree: TreeDetail
  }
  /**
   * 树
   * @param childTree 子节点
   * @param id id
   * @param treeName 节点名称
   */
  interface TreeDetail {
    childTree: TreeDetail[];
    id: string;
    treeName: string;
  }
}
