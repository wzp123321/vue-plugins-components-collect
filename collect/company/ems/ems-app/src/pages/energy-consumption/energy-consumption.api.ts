/*********************************************头部面板数据*******************************************/
/**
 * 表单数据
 */
export interface Ec_ITopPanelForm {
  // 树id
  treeId: string;
  // 树名称
  treeName: string;
  // 父节点名称
  parentNames: string;
  // 日期
  date: string;
  // 能源类型
  energyCode: string;
  // 子节点id
  childTreeId: string;
}
/**
 * 查询入参
 */
export interface Ec_IQueryParams {
  treeId: string;
  queryTime: string;
  energyCode: string;
}
/**
 * 导航栏样式
 */
export interface Ec_INavigatorStyle {
  color: string;
  backgroundColor: string;
}

/***********************************************纵览数据**************************************************/
/**
 * 纵览数据
 */
export interface Ec_IConsumptionData {
  /**
   * 本节点
   */
  nodeItem: Ec_INodeItem;
  /**
   * 子节点信息
   */
  childrenItem: Ec_INodeItem[];
  /**
   * 表头
   */
  childrenItemHead: string[];
}

/**
 * 能耗纵览---节点信息
 */
export interface Ec_INodeItem {
  itemId: string;
  itemName: string;
  energyValue: number | null;
  energyUnit: string;
  percent: string;
  percentValue: number | null;
  costValue: number | null;
  costUnit: string;
  lastMonthPercent: number | null;
  lastYearPercent: number | null;
  lastMonthCostPercent: number | null;
  lastYearCostPercent: number | null;
  strCostValue: string;
  parentItemName: string;
  hasChildren: boolean;
  children: Ec_INodeItem[];
}

/**
 * 能耗纵览---子节点列表
 */
export interface Ec_IChildNodeInfo {
  /**
   * 项ID
   */
  itemId: string;
  /**
   * 项名字
   */
  itemName: string;
  /**
   * 是否有子节点
   */
  hasChildren: boolean;
}

/**
 * 纵览-能耗饼图数据
 */
export interface Ec_IConsumptionBarData {
  id: string;
  name: string;
  value: number | null;
}

/**
 * 图表getIndex事件
 */
export interface Ec_IChartTouchEvent {
  currentIndex: {
    index: number;
    group: number[];
    id: string;
    legendIndex: number;
    type: string;
  };
}
