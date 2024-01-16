declare namespace UnitAreaEnergyRankModule {
  export interface TableListParam {
    id: number;
    isDesc: number;
    timeType: number;
    treeIds?: any[];
  }
  export interface TableListItem {
    treeName: string;
    value: number;
    area: number;
    unitAreaValue: number;
    treeId: number;
  }
}
