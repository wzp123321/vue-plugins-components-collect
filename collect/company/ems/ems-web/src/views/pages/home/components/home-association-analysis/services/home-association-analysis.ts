import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const AssociationAnalysisService = {
  /**
   * 查询关联分析配置
   */
  async getCompareConfig(uId: number) {
    const res: HttpRequestModule.ResTemplate<AssociationAnalysisModule.QueryCompareConfigRes> = await postRequest(
      '/energyPortal/queryCorrelationAnalyseConfig',
      uId,
    );
    return res;
  },
  /**
   * 查询关联分析列表
   */
  async getCompareEnergy(param: AssociationAnalysisModule.QueryCompareEnergyParam) {
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const res: HttpRequestModule.ResTemplate<AssociationAnalysisModule.QueryCompareEnergyRes[]> = await postRequest(
      '/energyPortal/queryCorrelationCoefficientList',
      p,
    );
    return res;
  },
};

export default AssociationAnalysisService;
