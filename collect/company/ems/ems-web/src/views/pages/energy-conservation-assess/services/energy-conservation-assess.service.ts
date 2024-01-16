import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const energyConservationService = {
  /**
   * 请求节能考核数据
   * @param params
   * @returns
   */
  async getEnergyConservationData(
    params: EnergyConservationAssess.QueryDataParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyConservationAssess.EnergyConservationAssessInfo>> {
    const res: HttpRequestModule.ResTemplate<EnergyConservationAssess.EnergyConservationAssessInfo> = await postRequest(
      '/saveenergycheck/querydata',
      params,
    );
    return res;
  },
  /**
   * 请求节能树
   * @param params
   * @returns
   */
  async getEnergyConservationTree(
    params: EnergyConservationAssess.QueryTreeParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyConservationAssess.KpiTree>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<EnergyConservationAssess.KpiTree> = await postRequest(
      '/saveenergycheck/querytree',
      p,
    );
    return res;
  },
};

export default energyConservationService;
