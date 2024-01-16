import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const CostCompareOverviewService = {
  /**
   * 获取能源类型数据
   */
  async getCompareConfig(uId: number) {
    const res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.QueryCompareConfigRes> = await postRequest(
      '/energyPortal/queryCompareConfig',
      uId,
    );
    return res;
  },
  /**
   * 获取日周月年能耗
   */
  async getCompareEnergy(param: any) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.QueryCompareEnergyRes[]> = await postRequest(
      '/energyPortal/queryCompareEnergy',
      p,
    );
    return res;
  },
  /**
   * 获取实时能耗曲线折线图
   */
  async getEnergyPortalContrastChart(param: CostCompareOverviewModule.QueryCompareEnergyParam) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<CostCompareOverviewModule.LineChartData> = await postRequest(
      '/energyPortal/queryEnergyPortalContrastChart',
      p,
    );
    return res;
  },
};

export default CostCompareOverviewService;
