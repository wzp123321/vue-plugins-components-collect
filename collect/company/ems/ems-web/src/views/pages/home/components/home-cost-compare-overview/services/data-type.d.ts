declare namespace CostCompareOverviewModule {
  // 能源类型
  export interface QueryCompareConfigRes {
    componentCode: string | null;
    createTime: string | null;
    energyCodes: EnergyCodes[];
    id: string | null;
    title: string | null;
    updateTime: string | null;
  }
  export interface EnergyCodes {
    code: string;
    name: string;
  }
  // 日周月年能耗
  export interface QueryCompareEnergyParam {
    energyCode: string;
  }
  export interface QueryCompareEnergyRes {
    currentEnergyValue: number | null;
    hbTitle: string | null;
    monthRatio: number | null;
    tbTitle: string | null;
    unit: string | null;
    yearRatio: number | null;
  }
  // 实时能耗曲线折线图
  export interface LineChartData {
    series: Series;
    xaxisTimes: string[];
    yaxisItemList: YAxisItem[];
  }
  export interface YAxisItem {
    title: string;
    unit: string;
  }
  export interface Series {
    name: string;
    data: number[];
    dataAttach: string[];
    colors?: string[];
    dataStatus?: any[];
    yaxis?: number;
  }
}
