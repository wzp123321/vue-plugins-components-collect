declare namespace KeyAreaAnalysisModule {
  export interface CardItem {
    valueUnit: string;
    lastValueTitle: string;
    lastYearValueTitle: string;
    lastValuePercentage: string;
    energyValue: string;
    lastYearValuePercentage: string | null;
    energyType: string;
  }

  export interface Energy {
    energyCode: string;
    treeId: number | string;
  }
  export interface AreasTree {
    id: number;
  }
}
