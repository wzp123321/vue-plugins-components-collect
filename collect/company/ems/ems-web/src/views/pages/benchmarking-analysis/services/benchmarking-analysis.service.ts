import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

const benchMarkingService = {
  /**
   * 查询父体系
   * @returns
   */
  async getParentList(): Promise<HttpRequestModule.ResTemplate<BenchMarkingAnalysis.ParentVO[]>> {
    const url = '/benchmarking/analysis/queryParentList';
    const res: HttpRequestModule.ResTemplate<BenchMarkingAnalysis.ParentVO[]> = await postRequest(url);
    return res;
  },
  /**
   * 根据父id查询子体系列表
   * @param params
   * @returns
   */
  async getChildListByParentId(params: {
    parentId: number;
  }): Promise<HttpRequestModule.ResTemplate<BenchMarkingAnalysis.ChildVO[]>> {
    const url = '/benchmarking/analysis/querySonListByParentId';
    const res: HttpRequestModule.ResTemplate<BenchMarkingAnalysis.ChildVO[]> = await postRequest(url, params);
    return res;
  },
  /**
   * 查询建筑列表
   * @param params
   * @returns
   */
  async getBenchmarkingBuildList(
    params: BenchMarkingAnalysis.QueryParams,
  ): Promise<
    HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<BenchMarkingAnalysis.BenchMarkingBuildVO[]>>
  > {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/benchmarking/analysis/queryBenchmarkingBuild';
    const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<
      BenchMarkingAnalysis.BenchMarkingBuildVO[]
    >> = await postRequest(url, p);
    return res;
  },
  /**
   * 查询对标分析建筑详情内树节点数据列表
   * @param params
   * @returns
   */
  async getBenchMarkingBuildDetail(
    params: BenchMarkingAnalysis.QueryBuildTreeParams,
  ): Promise<HttpRequestModule.ResTemplate<BenchMarkingAnalysis.BenchMarkingBuildDetail>> {
    const url = '/benchmarking/analysis/queryBenchmarkingBuildDetail';
    const res: HttpRequestModule.ResTemplate<BenchMarkingAnalysis.BenchMarkingBuildDetail> = await postRequest(
      url,
      params,
    );
    return res;
  },
};

export default benchMarkingService;
