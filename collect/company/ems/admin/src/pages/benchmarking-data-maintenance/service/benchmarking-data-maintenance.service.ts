import { postRequest } from '@/services/request';

const benchmarkingDataMaintenance = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: benchmarkingDataMaintenanceHttp.getListUrlType) {
    const res = await postRequest('/admin/benchmarking/data/query', params);
    return res;
  },
  /**
   * 修改
   * @param params
   * @returns
   */
  async updateUrl(params: any) {
    const res = await postRequest('/admin/benchmarking/data/save', params);
    return res;
  },
  /**
   * 导入
   * @param params
   */
  async uploadBenchmarkingData(params: any): Promise<any> {
    const res: any = await postRequest('/admin/benchmarking/data/upload/template', params);
    return res;
  },

  /**
   * 导出
   * @param params
   */
  async downloadBenchmarkingData(params: any): Promise<any> {
    const res: any = await postRequest('/admin/benchmarking/data/download/template', params);
    return res;
  },
  /**
   * 更新数据
   * @param params
   */
  async updateDataBenchmarkingData(params: any): Promise<any> {
    const res: any = await postRequest('/admin/benchmarking/data/updateData', params);
    return res;
  },
};

export default benchmarkingDataMaintenance;
