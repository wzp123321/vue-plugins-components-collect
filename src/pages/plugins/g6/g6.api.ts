export interface G6DataSourceVO {
  branchValue: number;
  children: G6DataSourceVO[];
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

export interface CommonObject {
  [key: string]: any;
}
