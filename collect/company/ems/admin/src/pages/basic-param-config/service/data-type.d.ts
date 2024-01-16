// basic-param-config
declare namespace BasicParamConfigModule {
  //    请求参数-点查询--分页显示
  export interface QueryParams extends GlobalModule.CommonSearchParams {
    // 采样类型
    energyCode: string | undefined | number;
  }
  //详情
  export interface BasicParamConfigInfo extends CreateParams {
  }
  // 删除
  export interface DeleteParams {
    id: number
  }
  // 新增
  export interface CreateParams {
    alarmLower: number;
    alarmUpper: number;
    comfortableLower: number;
    comfortableUpper: number;
    energyCode: string;
    energyCodeName: string;
    id: number;
    seasonId: number;
    seasonName?: string;
    weight: number;
  }
  // 编辑
  export interface UpdateParams extends UpdateParams {
  }


}