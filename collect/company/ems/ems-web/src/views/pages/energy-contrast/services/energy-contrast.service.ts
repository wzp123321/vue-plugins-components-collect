import { postRequest } from '@/services/request';

const EnergyContrastService = {
  /**
   * 查询能耗对比数据
   * @param params
   * @returns
   */
  async queryEnergyContrastChartData(
    params: EnergyContrastManageModule.EnergyContrastQueryParams,
  ): Promise<HttpRequestModule.ResTemplate<any>> {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(
      '/energyContrast/queryEnergyContrastChart',
      params,
    );
    return res;
  },
};

export default EnergyContrastService;
