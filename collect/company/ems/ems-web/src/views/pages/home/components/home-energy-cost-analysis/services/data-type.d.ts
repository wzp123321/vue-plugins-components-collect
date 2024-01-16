declare namespace EnergyCostAnalysisModule {
  export interface pieParam {
    id: number;
    timeType: string;
  }
  export interface energyCostAnalysisData {
    pieChartDataVO: energyList[];
    totalCost: number;
    unit: string;
  }
  export interface energyList {
    cost: number;
    energyCode: string;
    energyName: string;
    energyValue: number;
    tenThousandCost: number;
    unit: string;
  }
}
