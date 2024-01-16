import { getCampusParams } from '@/utils/token';
import { postRequest } from '@/services/request';

const EnergyCostAnalysisService = {
  /**
   * 获取成本分析数据
   */
  async getConsumptionRank(param: EnergyCostAnalysisModule.pieParam) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<EnergyCostAnalysisModule.energyCostAnalysisData> = await postRequest(
      '/energyPortal/queryComponentCostAnalysePieChartVO',
      p,
    );
    return res;
  },
};

export default EnergyCostAnalysisService;
