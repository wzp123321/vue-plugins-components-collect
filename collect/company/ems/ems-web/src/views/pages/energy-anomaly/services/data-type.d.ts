declare namespace EnergyAnomalyModule {
  //树类型
  export interface EnergyTreeType {
    id: number;
    reason: string | null;
    status: string;
    treeType: string;
    typeName: string;
  }
  // 分类分项
  export interface EnergyCodeInfo {
    code: string;
    name: string;
  }
  // 异常类型
  export interface AnomalyType {
    id: number;
    name: string;
  }
  // 树
  export interface AnomalyTree {
    abnormalTreeNumber: number;
    childTree: AnomalyTree[];
    lockFlag: boolean;
    treeId: number;
    treeName: string;
  }
  // 查询树参数
  export interface QueryAnomalyTreeParams {
    energyCode: string;
    treeType: number;
    typeIds: number[];
    userName: string;
  }
  // 查询异常列表参数
  export interface QueryAnomalyListParams extends QueryAnomalyTreeParams {
    id?: number;
    treeId: number;
    abnormalTime?: string;
  }
  // 查询详情参数
  export interface QueryAnomalyDetailtParams extends QueryAnomalyTreeParams {
    treeId: number;
    id: number;
    abnormalTime?: string;
  }
  // 异常接口公有字段
  export interface AnomalyBaseData {
    treeId: number;
    treeName: string;
    treePath: string;
  }
  // 异常详情
  export interface AnomalyInfo extends AnomalyBaseData {
    abnormalDay: number;
    abnormalNumber: number;
  }
  // 隐藏异常
  export interface PersonalHiddenAnomalyInfo extends AnomalyBaseData {
    hideCardList: HideCardInfo[];
  }
  // 卡片
  export interface HideCardInfo {
    hideDay: number | string;
    typeId: number;
    hideId: number;
    typeName: string;
    insertDay?: number | string;
    isInserting?: boolean;
  }
  // 取消隐藏请求参数
  export interface CancelHideCardParams {
    hideDay: number;
    treeId: number;
    typeId: number;
    userName: string;
  }
  // 异常详情
  export interface AnomalyDetail extends AnomalyBaseData {
    abnormalNumber: number;
    balance?: BalanceAnomalyInfo;
    basis?: BasisAnomalyInfo;
    contrast?: ContrastAnomalyInfo;
    correlation?: BaseAnomalyDetail;
    cost?: CostAnomalyInfo;
    kpi?: KpiAnomalyInfo;
    peak?: PeakAnomalyInfo;
    rank?: RankAnomalyInfo;
    ratio?: RatioAnomalyInfo;
  }
  // 各种类型异常基础接口
  export interface BaseAnomalyDetail {
    abnormalLevel: number;
    causeSet: [];
    solutionList: [];
    typeId: number;
    typeName: string;
    unit: string;
    alarmId: number;
  }
  // 能流平衡异常
  export interface BalanceAnomalyInfo extends BaseAnomalyDetail {
    branchValue: number;
    description: string;
    differenceRatio: number;
    totalValue: number;
  }
  // 同比异常
  export interface BasisAnomalyInfo extends BaseAnomalyDetail {
    currentValue: number;
    description: string;
    differenceRatio: number;
    isIncreaseOrReduce: boolean;
  }
  // 能耗对比异常
  export interface ContrastAnomalyInfo extends BaseAnomalyDetail {
    abnormalContrastDataList: AbnormalContrastDataList;
  }
  // 能耗对比详情
  export interface AbnormalContrastDataList {
    alarmId: number;
    abnormalLevel: number;
    contrastTreeName: string;
    contrastTreePath: string;
    contrastValue: number;
    currentValue: number;
    contrastTreeId: number;
    description: string;
    differenceRatio: number;
  }
  // 关联分析详情
  export interface AbnormalCorrelationDataList {
    alarmId: number;
    abnormalLevel: number;
    coefficient: number;
    contrastDate: string;
    contrastValue: string;
    correlationStatus: string;
    highCoefficient: number;
    lowCoefficient: number;
    paramName: string;
    unit: string;
    yesterdayValue: string;
  }
  // 成本异常详情
  export interface CostAnomalyInfo extends BaseAnomalyDetail {
    currentValue: number;
    description: string;
    differenceRatio: number;
    energyCodeName: string;
    targetValue: number;
  }
  // 节能考核异常
  export interface KpiAnomalyInfo extends BaseAnomalyDetail {
    currentValue: number;
    description: string;
    differenceRatio: number;
    quotaValue: number;
    trendAbnormalTime: string;
  }
  // 峰值异常
  export interface PeakAnomalyInfo extends BaseAnomalyDetail {
    description: string;
    peakTimes: string;
    val: number;
  }
  // 排名变化异常
  export interface RankAnomalyInfo extends BaseAnomalyDetail {
    abnormalRankDataList: AbnormalRankDataList;
  }
  // 排名变化详情
  export interface AbnormalRankDataList {
    alarmId: number;
    abnormalLevel: number;
    currentRank: number;
    description: string;
    differenceRank: number;
    groupName: string;
    isIncreaseOrReduce: boolean;
  }
  // 用能异常
  export interface RatioAnomalyInfo extends BaseAnomalyDetail {
    currentValue: number;
    description: string;
    differenceRatio: number;
    isIncreaseOrReduce: boolean;
  }
  // 已处理异常表单
  export interface ProcessedAbnormalForm {
    treeType: number;
    energyCode: string;
    date: Date[];
  }
  // 已处理异常请求参数
  export interface ProcessedAbnormalParams {
    treeType: string;
    energyCode: string;
    startTime: string;
    endTime: string;
  }
  // 已处理异常详情
  export interface ProcessedAbnormalInfo {
    typeId: number;
    otherName: string;
    dealTime: string;
    typeName: string;
    treePath: string;
    treeName: string;
    handleRemarks: string;
  }
}
