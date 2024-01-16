import { postRequest } from '@/services/request';

/**
 * 查询对标分析数据
 * @param params
 * @returns
 */
export const getBenchMarkingData = async (params: AirportBenchMarkingAnalysisModule.QueryParams)
    : Promise<HttpRequestModule.ResTemplate<AirportBenchMarkingAnalysisModule.ChartExplainInfo>> => {
    const url = '/TargetStore/queryTarget';
    const res: HttpRequestModule.ResTemplate<AirportBenchMarkingAnalysisModule.ChartExplainInfo> = await postRequest(url, params);
    return res;
};
