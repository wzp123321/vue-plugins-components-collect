import { postRequest } from '@/service/request';
/*
 * @Description: services
 * @Autor: zpwan
 * @Date: 2022-04-20 14:34:05
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-20 17:27:13
 */
class EnergySaveProjectService {
  /**
   * 查询项目类型
   * @param params
   * @returns
   */
  public getEnergySaveType = async (
    params: GeneralModule.TenantVO
  ): Promise<HttpRequestModule.ResTemplate<NHouseholdNumber.EnergyCodeVO[]>> => {
    const url = '/baseHead/queryEnergySaveType';
    const res: HttpRequestModule.ResTemplate<NHouseholdNumber.EnergyCodeVO[]> = await postRequest(url, params);
    return res;
  };
  /**
   * 查询节能项目数据列表
   * @param params
   * @returns
   */
  public getEnergySaveProjectList = async (
    params: MaEnergySaveProjDM.SearchParams
  ): Promise<HttpRequestModule.ResTemplate<MaEnergySaveProjDM.EnergySaveProjVO[]>> => {
    const url = '/energySaveProject/query';
    const res: HttpRequestModule.ResTemplate<MaEnergySaveProjDM.EnergySaveProjVO[]> = await postRequest(url, params);
    return res;
  };
  /**
   * 查询基准值
   * @param params
   * @returns
   */
  public getBasicValue = async (
    params: MaEnergySaveProjDM.SearchParams
  ): Promise<HttpRequestModule.ResTemplate<MaEnergySaveProjDM.BasicValueVO>> => {
    const url = '/monthValue/query';
    const res: HttpRequestModule.ResTemplate<MaEnergySaveProjDM.BasicValueVO> = await postRequest(url, params);
    return res;
  };
  /**
   * 维护基准值
   * @param params
   * @returns
   */
  public getBasicValueEditor = async (
    params: MaEnergySaveProjDM.BasicValueMaintainParams
  ): Promise<HttpRequestModule.ResTemplate<number>> => {
    const url = '/monthValue/update';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  };
}

export default new EnergySaveProjectService();
