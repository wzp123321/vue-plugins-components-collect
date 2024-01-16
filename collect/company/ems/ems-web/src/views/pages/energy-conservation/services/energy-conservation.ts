import { postRequest } from '@/services/request';

const EnergyConservationServation = {
  /**
   * 头部 能源类型
   * @param params
   */
  async getEnergyType(
    params?: number,
  ): Promise<HttpRequestModule.ResTemplate<any>> {
    const reqUrl = '/admin/energy/code/list';
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 获取列表
   * @param params
   */
  async getList(
    params: energyConservation.getListType,
  ): Promise<HttpRequestModule.ResTemplate<energyConservation.returnListTYPE>> {
    const reqUrl = '/saveenergyquota/query';
    const res: HttpRequestModule.ResTemplate<energyConservation.returnListTYPE> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 新增
   * @param params
   */
  async addUrl(
    params: energyConservation.addUrlType,
  ): Promise<HttpRequestModule.ResTemplate<null>> {
    const reqUrl = '/saveenergyquota/add';
    const res: HttpRequestModule.ResTemplate<null> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 修改
   * @param params
   */
  async getTreeBindRefresh(
    params: energyConservation.upadateUrlType,
  ): Promise<HttpRequestModule.ResTemplate<null>> {
    const reqUrl = '/saveenergyquota/update';
    const res: HttpRequestModule.ResTemplate<null> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 删除
   * @param params
   */
  async getTreeUnBind(
    params: number,
  ): Promise<HttpRequestModule.ResTemplate<null>> {
    const reqUrl = '/saveenergyquota/delete';
    const res: HttpRequestModule.ResTemplate<null> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 导入
   * @param params
   */
  async getDeviceList(params: any): Promise<any> {
    const reqUrl = '/saveenergyquota/uploadSaveEnergyQuota';
    const res: any = await postRequest(reqUrl, params);
    return res;
  },
};

export default EnergyConservationServation;
