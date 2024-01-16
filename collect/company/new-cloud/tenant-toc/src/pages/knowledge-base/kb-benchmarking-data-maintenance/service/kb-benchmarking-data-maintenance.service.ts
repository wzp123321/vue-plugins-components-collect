import { postRequest } from '@/service/request';

class BenchMarkingDataMaintenance {
  /**
   * 查询对标体系下拉数据
   * @param params 参数
   */
  public queryBenchmarkingSyetemSelect = async () => {
    const url = '/tenant/benchmarking/system/list';
    const res = await postRequest(url);
    return res;
  };

  /**
   * 查询对标数据维护列表
   * @param params 参数
   */
  public queryBenchmarkingDataMaintenanceList = async (params: BenchmarkingDataMaintenance.GetListUrlParams) => {
    const url = '/tenant/benchmarking/data/query';
    const res = await postRequest(url, params);
    return res;
  };

    /**
   * 查询对标数据维护列表
   * @param params 参数
   */
     public updateBenchmarkingData = async (params: BenchmarkingDataMaintenance.CreateBenchmarkingDataParams) => {
      const url = '/tenant/benchmarking/data/save';
      const res = await postRequest(url, params);
      return res;
    };

     /**
   * 查询对标数据维护列表
   * @param params 参数
   */
      public uploadBenchmarkingData = async (params: any) => {
        const url = '/tenant/benchmarking/data/upload/template';
        const res = await postRequest(url, params);
        return res;
      };
}

export default new BenchMarkingDataMaintenance();
