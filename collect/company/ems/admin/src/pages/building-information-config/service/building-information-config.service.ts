import { postRequest } from '@/services/request';

const buildingInformationService = {
  /**
   * 获取列表
   */
  async getInitTab(
    params: GlobalModule.CommonSearchParams,
  ): Promise<
    HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<BuildingInformationModule.BuildingInformationInfo[]>
    >
  > {
    const res: HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<BuildingInformationModule.BuildingInformationInfo[]>
    > = await postRequest('/admin/query/config/benchmarking/building/page', params);
    return res;
  },
  /**
   * 查询字典dict数据
   * @param params
   * @returns
   */
  async getBuidingTypeData(params: string) {
    const reqUrl = '/dict/query';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 新增
   */
  async addBuildingInfo(params: BuildingInformationModule.CreateParams) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(
      '/admin/add/config/benchmarking/building',
      params,
    );
    return res;
  },
  /**
   * 编辑
   */
  async editBuildingInfo(params: BuildingInformationModule.UpdateParams) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(
      '/admin/update/config/benchmarking/building',
      params,
    );
    return res;
  },
  /**
   * 删除
   */
  async deleteBuildingInfo(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(
      '/admin/delete/config/benchmarking/building',
      params,
    );
    return res;
  },
};

export default buildingInformationService;
