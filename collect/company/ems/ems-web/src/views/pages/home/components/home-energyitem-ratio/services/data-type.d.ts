declare namespace EnergyItemRatioModule {
  interface YaxisItemList {
    title: string;
    unit: string;
  }
  export interface DataList {
    nodeName: string;
    yAxisItems: YaxisItemList[];
    dataList: ItemCode[];
  }
  export interface ItemCode {
    value: any;
    name: string;
    areaId: string;
  }
}
