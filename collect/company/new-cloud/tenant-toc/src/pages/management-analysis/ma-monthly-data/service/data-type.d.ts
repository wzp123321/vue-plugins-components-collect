declare namespace MonthlyData {
  /**
   * table表格数据，查询接口返回参数
   * @param monthlyDataQueryVO 标头名称
   * @param monthlyDataQueryVOList 	指标数据分页列表
   * @param systemId  对标对象id
   * @param valueDate 	数据时间
   * @param monthlyDataValueQueryVOList 指标数据列表
   * @param income 	收入
   * @param cost 成本
   * @param stateGridInvestment 国网初始投资额
   * @param energyBenchmark 能耗基准
   * @param energyConsumptionOutsideBoundary 边界外能耗
   * @param stateGridRevenue 归属国网收益
   * @param selfProducedHardware 自产硬件
   * @param purchasedMaterials 外购物料
   * @param purchasedSoftware 外购软件
   * @param liJu 力聚
   * @param thirdPartyInterface 第三方接口
   * @param deliveryLaborCost 交付人工成本
   * @param constructionOutsourcing 施工外包
   */
  export interface TableDataSourceVO {
    month: number | string;
    incomeDataList: string[];
    costDataList: string[];
    masterData: string[];
  }

  // 年份 list
  export interface type {
    code: string;
    name: string;
  }

  // 文件流type
  export interface fileType {
    lastModified: number;
    lastModifiedDate: any;
    name: string;
    size: number;
    type: string;
    webkitRelativePath: string;
  }

  /**
   * 查询 接口入参
   */
  export interface queryMonthlyDataList {
    tenantCode: string;
    tenantId: number;
    year?: string;
  }
}
