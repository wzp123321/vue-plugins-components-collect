declare namespace AssociationAnalysisModule {
  // 能源类型
  export interface QueryCompareConfigRes {
    componentCode: string | null;
    correlationTreeInfoMap: EnergyCodes;
    energyCodeNameVOList: Array<{
      energyCode: string;
      energyName: string;
    }>;
    id: number | null;
    title: string | null;
  }
  export interface EnergyCodes {
    [key: string]: Array<{
      id: number;
      treeName: string;
    }>;
  }

  // 查询关联分析列表入参
  export interface QueryCompareEnergyParam {
    energyCode: string;
    treeIds: any[];
    id: number;
  }

  // 查询关联分析列表返回参数
  export interface QueryCompareEnergyRes {
    coefficient: number | null;
    correlationResult: string | null;
    paramName: number | null;
    treeName: string | null;
  }
}
