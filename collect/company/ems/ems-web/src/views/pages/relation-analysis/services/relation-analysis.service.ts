import { postRequest } from '@/services/request';

const relationAnalysisService = {
  /**
   * 获取关联分析前台主体展示
   * @param params
   * @returns
   */
  async queryCorrelationAnalyseChartShow(
    params: RelationAnalysisModule.RelationAnalysisQueryParams,
  ): Promise<
    HttpRequestModule.ResTemplate<RelationAnalysisModule.RelationAnalysisInfo>
  > {
    const res: HttpRequestModule.ResTemplate<RelationAnalysisModule.RelationAnalysisInfo> = await postRequest(
      '/correlationAnalyse/queryCorrelationAnalyseChartShow',
      params,
    );
    return res;
  },
};

export default relationAnalysisService;
