declare namespace EnergyConsumptionRankModule {
  export interface TableParam {
    id: number;
    sort: number;
    timeType: number;
  }
  export interface TableListItem {
    area?: number;
    id?: number;
    treeName: string;
    value: number;
  }
  export interface TableRes {
    energyName: string;
    title: string;
    treeVoList: TableListItem[];
    unit: string;
  }
}
