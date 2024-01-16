import { postRequest } from '@/service/request';
class BenchmarkValueMaintenanceService {
  /**
   * 查询基准值列表
   * @param params 参数
   */
  public queryBenchmarkValueMaintenanceList = async (
    params: BenchmarkValueMaintenance.queryBenchmarkValueMaintenanceList
  ) => {
    const url = '/benchmarkValue/query';
    const res = await postRequest(url, params);
    return res;
  };

   /**
   * 修改基准值列表
   * @param params 参数
   */
    public updateBenchmarkValueMaintenanceList = async (
        params: BenchmarkValueMaintenance.updateBenchmarkValueMaintenance
      ) => {
        const url = '/benchmarkValue/update';
        const res = await postRequest(url, params);
        return res;
      };

  /**
   * 查询月度比例表
   * @param params 参数
   */
   public queryHouseholdNumberList = async (
    params: BenchmarkValueMaintenance.queryBenchmarkValueMaintenanceList
  ) => {
    const url = '/monthRatio/query';
    const res = await postRequest(url, params);
    return res;
  };

   /**
   * 更新基准值列表
   * @param params 参数
   */
    public updateHouseholdNumberList = async (
        params: BenchmarkValueMaintenance.HouseholdNumberListVO
      ) => {
        const url = '/monthRatio/update';
        const res = await postRequest(url, params);
        return res;
      };
}
export default new BenchmarkValueMaintenanceService();
