declare namespace EnvironmentEvaluationModule {
  // 请求列表
  export interface QueryParams extends GlobalModule.CommonSearchParams {
    description: string;
  }

  // 请求所有列表
  export interface QueryAllParams
    extends GlobalModule.HttpBlobRequestResponsive {
    // description: string;
  }

  // 详情--list
  export interface EnvironmentEvaluationInfo {
    description: string;
    energyCode: string;
    energyCodeName: string;
    id: number;
    lower: number;
    upper: number;
  }

  // 编辑
  export interface UpdateParams extends EnvironmentEvaluationInfo {
    description?: string;
    energyCode?: string;
    energyCodeName: string | null;
    id: number;
    lower: number;
    upper: number;
  }
}
