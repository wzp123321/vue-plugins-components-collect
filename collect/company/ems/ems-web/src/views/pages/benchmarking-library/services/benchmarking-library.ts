import { getCampusParams } from '@/utils/token';
import url from '@/api/api-url';
import { postRequest } from '@/services/request';

const BenchmarkingLibraryService = {
  /**
   * 获取对标对象数据
   * @param params
   * @returns
   */
  async getBenchmarkingObjectList() {
    const params = getCampusParams();
    const url = '/benchmarking/queryHospitalAreaTree';
    const res = await postRequest(url, params);
    return res;
  },

  /**
   * 根据分组id批量查询树列表
   * @param params
   * @returns
   */
  async getBenchmarkingLibraryList(
    params: any,
  ): Promise<HttpRequestModule.ResTemplate<BenchmarkingLibraryModule.BenchmarkingLibraryParams>> {
    const url = '/benchmarking/queryBenchmarking';
    const res: HttpRequestModule.ResTemplate<BenchmarkingLibraryModule.BenchmarkingLibraryParams> = await postRequest(
      url,
      params,
    );
    return res;
  },
};

export default BenchmarkingLibraryService;
