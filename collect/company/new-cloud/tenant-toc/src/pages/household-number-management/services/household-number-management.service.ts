import { postRequest } from '@/service/request';
class HouseholdNumberManagementService {
  /**
   * 分页查询户号管理列表
   * @param params 分页参数
   */
  public queryHouseholdNumberList = async (params: HouseholdNumberManagement.queryHouseholdNumberList) => {
    const url = '/tenantAccount/queryTenantAccountPage';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 新增户号管理列表
   * @param params 新增参数
   */
  public addHouseholdNumberList = async (params: HouseholdNumberManagement.addHouseholdNumber) => {
    const url = '/tenantAccount/add';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 编辑户号管理列表
   * @param params 编辑参数
   */
  public updateHouseholdNumberList = async (params: HouseholdNumberManagement.updateHouseholdNumber) => {
    const url = '/tenantAccount/update';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 删除户号管理列表
   * @param params 删除参数
   */
  public deleteHouseholdNumber = async (params: number) => {
    const url = '/tenantAccount/delete';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 根据分类分项查询户号
   * @param params 参数
   */
  public queryAccountNumberByEnergyCode = async (
    params: HouseholdNumberManagement.queryAccountNumberByEnergyCodeParams
  ) => {
    const url = '/tenantAccount/queryAccountNumberByEnergyCode';
    const res = await postRequest(url, params);
    return res;
  };
  /**
   * 导入
   * @param params 参数
   */
  public upload = async (params: any) => {
    const url = '/tenantAccount/template/upload';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 获取托管区域列表
   */
  public queryHostingAreaList = async (params: any) => {
    const url = '/tenantAccount/hostingAreaListByEnergyCode';
    const res = await postRequest(url, params);
    return res;
  };
}
export default new HouseholdNumberManagementService();
