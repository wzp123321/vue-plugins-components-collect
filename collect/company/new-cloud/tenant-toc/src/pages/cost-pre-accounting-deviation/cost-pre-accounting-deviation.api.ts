import { CPAD_EDateType } from './components/cpad-search/cpad-search.api';

export enum CpAd_CollapseName {
  直接成本 = '直接成本',
  运营成本 = '运营成本',
  项目成本合计 = '项目成本合计',
  '项目收入(不含税)' = '项目收入(不含税)',
}

export interface CostAccountingQueryPageRequest {
  /**
   * 时间维度
   */
  type?: CPAD_EDateType;
  /**
   * 查询年
   */
  startTime?: string | null;
  /**
   * 查询月
   */
  endTime?: string | null;
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 租户code
   */
  tenantCode?: string;
}

export interface CostAccountingQueryPageResponse {
  incomeCostInfo: CostAccountingCostInfo;
  incomeCostTable: {
    titleList: CostAccountingTitleList[];
    lineVOList: CostAccountingLineVOList[];
  };
  directCostInfo: CostAccountingCostInfo;
  directCostTable: {
    titleList: CostAccountingTitleList[];
    lineVOList: CostAccountingLineVOList[];
  };
  operateCostInfo: CostAccountingCostInfo;
  operateCostTable: {
    titleList: CostAccountingTitleList[];
    lineVOList: CostAccountingLineVOList[];
  };
  totalCostInfo: CostAccountingCostInfo;
  monthConcern: CostAccountingMonthConcern[];
  logList?: CostAccountingLogList[];
  logListTop5?: CostAccountingLogList[];
  commentList?: CostAccountingCommentList[];
}

export interface CostAccountingUpdateRequest extends CostAccountingQueryPageRequest {
  /**
   * 直接成本数据list
   */
  directCostTable?: CostAccountingLineVOList[];
  /**
   * 运营成本数据list
   */
  operateCostTable?: CostAccountingLineVOList[];
  /**
   * 项目收入list
   */
  incomeCostTable?: CostAccountingLineVOList[];
}

export interface CostAccountingLineVOList {
  num?: string | null;
  category?: string | null;
  costType?: string | null;
  predictCost?: string | null;
  actualCost?: string | null;
  deviation?: string | null;
  deviationRate?: string | null;
  deviationAnalysis?: string | null;
  operateStrategy?: string | null;
  nodeId?: number | null;
  level?: string | null;
  parentId?: number | null;
  sort?: number | null;
  leafFlag?: boolean | null;
  mergeFlag?: boolean | null;
  actualCostChangeFlag?: boolean | null;
  actualCostFinancialFlag?: boolean | null;
}

interface CostAccountingCostInfo {
  name?: string;
  predictCost?: string;
  actualCost?: string;
  deviation?: string;
  deviationRate?: string;
}

interface CostAccountingTitleList {
  code?: string;
  name?: string;
}

interface CostAccountingMonthConcern {
  itemPartName?: string;
  itemCount?: number;
  items?: {
    itemName?: string;
    rate?: string;
  }[];
}

interface CostAccountingLogList {
  logInfo?: string;
  date?: string;
}

interface CostAccountingCommentList {
  username?: string;
  date?: string;
  comment?: string;
}

/**
 * 编辑按钮权限校验
 */
export interface CPAD_IRes<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export enum CPAD_EEditType {
  项目收入 = 'incomeCostTable',
  直接成本 = 'directCostTable',
  运营成本 = 'operateCostTable',
}
