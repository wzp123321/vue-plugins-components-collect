export enum EAnomalyTypes {
  能流平衡异常 = 1,
  用能异常 = 2,
  排名变化 = 3,
  关联分析异常 = 4,
  峰值时间异常 = 5,
  节能考核异常 = 6,
  同比异常 = 7,
  能耗对比异常 = 8,
  成本异常 = 9,
  边界异常 = 10,
}

export enum EAbnormalTabType {
  用能异常 = '1',
  边界异常 = '2',
}

export enum EBoundaryType {
  未触发边界 = '2',
  触发边界 = '1',
  未查看 = '0',
}

export interface EA_IPagination {
  pageNum: number;
  pageSize: number;
  total: number;
}

/**
 * @param treeLoading tree加载
 * @param treeFilterText 树过滤文本
 * @param typeIds 异常类型
 * @param energyCodeList 分类分项列表
 * @param anomalyTypeList 异常类型列表
 * @param anomalyTreeList 异常树列表
 * @param queryTreeParams 请求tree需要的参数
 * @param onTreeTypeChange 区域业态切换fn
 * @param onTreeSelect
 * @param queryInitailParamsFn 请求初始化必要参数方法Fn
 * @param queryAnomalyTreeList 请求tree必要参数方法Fn
 * @param queryAnomalyTreeListCb 请求树节点回调
 * @param onHiddenAnomalyDialogShow
 */
export interface EnergyAnomalyTreeState {
  treeLoading: boolean;
  showTreeNoData: boolean;
  treeFilterText: string;
  typeIds: number[];
  hasHideAbnormalFlag: boolean;
  anomalyTreeList: EnergyAnomalyModule.AnomalyTree[];
  energyCodeList: EnergyAnomalyModule.EnergyCodeInfo[];
  anomalyTypeList: EnergyAnomalyModule.AnomalyType[];
  queryTreeParams: EnergyAnomalyModule.QueryAnomalyTreeParams;
  currentTreeNodeName: string;
  onTreeTypeChange: (value: number) => void;
  onTreeSelect: (value: EnergyAnomalyModule.AnomalyTree) => void;
  queryInitailParamsFn: () => void;
  queryAnomalyTreeList: () => void;
  queryAnomalyTreeListCb: () => void;
  onHiddenAnomalyDialogShow: () => void;
  onProcessedAbnormalDialogShow: () => void;
  onSearch: () => void;
}

/**
 * @param loading 加载
 *
 */
export interface EnergyAnomalySelectState {
  loading: boolean;
  showNoData: boolean;
  queryAnomalyListParams: EnergyAnomalyModule.QueryAnomalyListParams;
  anomalyList: EnergyAnomalyModule.AnomalyInfo[];
  queryAnomalyDetailParams: EnergyAnomalyModule.QueryAnomalyDetailtParams;
  queryAnomalyList: () => void;
  onAnomalyItemClick: (treeId: number, id: number, abnormalTime?: string) => void;
  onOperateRefresh: () => void;
}

export interface TreeTypeList {
  value: number;
  label: string;
}

/**
 * 卡片详情
 */
export interface EA_IAnomalyCardVO {
  abnormalDay: number;
  abnormalNumber: number;
  treeId: number;
  treeName: string;
  treePath: string;

  abnormalStatus?: string;
}

/**
 * 查询实时异常 结果
 */
export interface EA_IActualAnomalyResult {
  abnormalTime: string;
  abnormalShowTime: string;
  abnormalTreeCardList: EA_IAnomalyCardVO[];
}

// 异常接口公有字段
export interface EA_IAnomalyBaseData {
  treeId: number;
  treeName: string;
  treePath: string;
}

/**
 * 异常详情
 * @param abnormalNumber 异常数量
 * @param balance 能流平衡异常
 * @param basis 同比异常
 * @param contrast 能耗对比
 * @param correlation 关联分析异常
 * @param cost 成本异常
 * @param kpi KPI异常
 * @param peak 峰值分析异常
 * @param rank 排名异常
 * @param ratio 用能异常（已废弃）
 * @param energy 用能异常
 * @param boundary 用能异常
 */
export interface EA_IAnomalyDetail extends EA_IAnomalyBaseData {
  abnormalNumber: number;
  balance?: EA_IBalanceAnomalyInfo;
  basis?: EA_IBasisAnomalyInfo;
  contrast?: EA_IContrastAnomalyInfo;
  correlation?: EA_IBaseAnomalyDetail;
  cost?: EA_ICostAnomalyInfo;
  kpi?: EA_IKpiAnomalyInfo;
  peak?: EA_IPeakAnomalyInfo;
  rank?: EA_IRankAnomalyInfo;
  ratio?: EA_IRatioAnomalyInfo;
  energy?: EA_IEnergyAnomalyInfo;
  boundary?: EA_IBoundaryAnomalyInfo;
}

// 各种类型异常基础接口
export interface EA_IBaseAnomalyDetail {
  abnormalLevel: number;
  causeSet: [];
  solutionList: [];
  typeId: number;
  typeName: string;
  unit: string;
  alarmId: number;
}
// 实时异常
export interface EA_IEnergyAnomalyInfo extends EA_IBaseAnomalyDetail {
  abnormalCorrelationDataList: EA_IAbnormalCorrelationDataList[];
  actualValue: number;
  currentTimestamp: number;
  description: string;
  deviationRate: number;
  predictTimestamp: number;
  predictValue: number;
}
/**
 * 能耗边界异常
 */
export interface EA_IBoundaryAnomalyInfo extends EA_IBaseAnomalyDetail {
  abnormalTime: string;
  afterValue: number;
  afterValueStr: string;
  beforeValue: number;
  beforeValueStr: string;
  deviationRate: number;
  deviationRateStr: string;
  endTime: string;
  energyEventId: string;
  energyEventCreateTime?: string;
  energyEventType: string;
  startTime: string;
  treeId: number;
  treeName: string;
  treePath: string;
  triggerFlag: string;
  triggerFlagStr: string;
}
// 能流平衡异常
export interface EA_IBalanceAnomalyInfo extends EA_IBaseAnomalyDetail {
  branchValue: number;
  description: string;
  differenceRatio: number;
  totalValue: number;
}
// 同比异常
export interface EA_IBasisAnomalyInfo extends EA_IBaseAnomalyDetail {
  currentValue: number;
  description: string;
  differenceRatio: number;
  isIncreaseOrReduce: boolean;
}
// 能耗对比异常
export interface EA_IContrastAnomalyInfo extends EA_IBaseAnomalyDetail {
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
export interface EA_ICostAnomalyInfo extends EA_IBaseAnomalyDetail {
  currentValue: number;
  description: string;
  differenceRatio: number;
  energyCodeName: string;
  targetValue: number;
}
// 节能考核异常
export interface EA_IKpiAnomalyInfo extends EA_IBaseAnomalyDetail {
  currentValue: number;
  description: string;
  differenceRatio: number;
  quotaValue: number;
  trendAbnormalTime: string;
}
// 峰值异常
export interface EA_IPeakAnomalyInfo extends EA_IBaseAnomalyDetail {
  description: string;
  peakTimes: string;
  val: number;
}
// 排名变化异常
export interface EA_IRankAnomalyInfo extends EA_IBaseAnomalyDetail {
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
export interface EA_IRatioAnomalyInfo extends EA_IBaseAnomalyDetail {
  currentValue: number;
  description: string;
  differenceRatio: number;
  isIncreaseOrReduce: boolean;
}

export interface EA_IAbnormalCorrelationDataList {
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
