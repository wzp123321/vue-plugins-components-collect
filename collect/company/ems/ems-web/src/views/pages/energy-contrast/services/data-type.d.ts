/**
 * 分层分类模块
 */
declare namespace EnergyContrastManageModule {
  /**
   * 查询分层分类params
   */
  interface EnergyContrastQueryParams {
    energyCode: any;
    queryFlag: number;
    queryTime?: {
      endTime: string;
      startTime: string;
    };
    timeType: number;
    timeUnit?: string;
    treeIds: Array;
    valueMean: string;
    multiTimeList?: Array<string>;
  }
  /**
   * 折线图
   */
  interface EnergyContrastEchartsInfo {
    barChart: any;
    energyTableList: any;
  }

  //  导出报告
  export interface EnergyContrastExportWordParams {
    contrastPhoto: File;
    energyCode: string;
    multiTimeList: string[];
    queryFlag: number;
    queryTime: {
      startTime: string;
      endTime: string;
    };
    timeType: number;
    timeUnit: string;
    treeIds: number[];
    unitList: string;
    valueMean: string;
  }
}
