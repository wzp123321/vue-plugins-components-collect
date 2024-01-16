import { postRequest } from '@/service/request';
/*
 * @Description:
 * @Autor: zpwan
 * @Date: 2022-04-07 09:43:35
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-19 18:57:27
 */
class ProjectInformationConfigurationService {
  /**
   * 分页查询项目列表
   * @param params 分页参数
   * @returns
   */
  public queryProjectList = async (params: ProjectInformationConfigurationList.SearchForm) => {
    const url = '/tenantConfig/queryTenantConfigPage';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 预览项目管理配置logo和跳转路径
   * @param params 租户信息
   * @returns
   */
  public querySingleTenantConfig = async (
    params: ProjectInformationConfigurationList.QuerySingleTenantConfigParams
  ): Promise<HttpRequestModule.ResTemplate<ProjectInformationConfigurationList.QuerySingleTenantConfigVO>> => {
    const url = '/tenantConfig/querySingleTenantConfig';
    const res: HttpRequestModule.ResTemplate<ProjectInformationConfigurationList.QuerySingleTenantConfigVO> =
      await postRequest(url, params);
    return res;
  };

  /**
   * 更新项目管理logo和ems路径
   * @returns
   */
  public updateTenantConfig = async (params: any) => {
    const url = '/tenantConfig/updateTenantConfig';
    const res = await postRequest(url, params);
    return res;
  };
  /**
   * 查询ems版本下拉list
   * @returns
   */
  public queryEmsVersion = async (params: string) => {
    const url = '/tenantDict/detail/queryByCode';
    const res = await postRequest(url, params);
    return res;
  };
}

export default new ProjectInformationConfigurationService();
