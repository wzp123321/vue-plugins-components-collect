declare namespace EnergyBalanceModule {
  /**
   * 头部搜索入参
   */
  export interface PageSearchParams {
    endTime: string;
    energyCode: string;
    startTime: string;
    treeId?: number;
    treeType: number;
  }
  /**
   * 头部表单
   */
  export interface PageFormParams extends PageSearchParams {
    date: any[];
    energyCode: string[];
  }
  /**
   * 能流平衡
   */
  export interface EnergyBalanceInfo {
    branchValue: number;
    children: EnergyBalanceInfo[];
    dailyGrowth: number;
    differenceRatio: number;
    hasChildren: boolean;
    totalValue: number;
    treeId: number;
    treeName: string;
    collapsed: boolean;
    limitFlag: boolean;
    unit: string;
    yesterdayValue: number;
  }
  export interface QuerySystemManagementParams {
    id: number;
    moduleKey: string;
  }
  export interface AllTreeTypeListItem {
    label: string;
    value: number;
    [key: string]: any;
  }
}
