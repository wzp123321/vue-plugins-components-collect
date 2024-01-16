import { postRequest } from '@/service/request';

const BenchMarkingSystem = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: BenchmarkingLibrary.getListUrlParams): Promise<
    HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<BenchmarkingLibrary.tableDataSourceVO[]>>> {
    const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<BenchmarkingLibrary.tableDataSourceVO[]>> = await postRequest('/tenant/benchmarking/system/query', params);
    return res;
  },
  /**
   * 删除数据
   * @param params
   * @returns
   */
  async deleteUrl(params: BenchmarkingLibrary.deleteUrlParams) {
    const res = await postRequest('/tenant/benchmarking/system/delete', params);
    return res;
  },
  /**
   * 获取对标体系列表 (用于对标数据维护)
   * @param params
   * @returns
   */
  async queryListUrl() {
    const res = await postRequest('/tenant/benchmarking/system/list');
    return res;
  },

  /**
   * 新增
   * @param params
   * @returns
   */
  async addurl(params: BenchmarkingLibrary.addUrlParams) {
    const res = await postRequest('/tenant/benchmarking/system/create', params);
    return res;
  },
  /**
   * 修改
   * @param params
   * @returns
   */
  async updateUrl(params: BenchmarkingLibrary.updateUrlParams) {
    const res = await postRequest('/tenant/benchmarking/system/update', params);
    return res;
  },
};

export default BenchMarkingSystem;
