declare namespace loadForecatService {
  /**
   * 数据请求传参
   * @param energyCode 能源分类分项编码
   * @param queryFlag 1多对象对应单一时间 2多时间对应单对象 无多对多
   * @param queryTime 	时间列表
   * @param timeUnit 时间颗粒度 0：10m 1：时 2：天 4：月 5：年
   * @param treeIds 分析树节点对象ID
   * @param valueMean 1实际值 2人均 3面均 4标煤 5co2
   */
  interface getForecastDataUrlType {
    endTime: string;
    energyCode: string;
    startTime: string;
    timeUnit: string;
    treeId: number;
  }
  interface returnForecastDataUrlType {
    barChart: any;
    forecastDetails: object[];
    forecastTotal: null | number | string;
    historyTotal: null | number | string;
  }
}
