import { postRequest } from '@/service/request';
import { getListUrlType } from './log-management.api';

const logManagement = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: getListUrlType) {
    const res = await postRequest('/log/query', params);
    return res;
  },

  /**
   * 导出
   * @param params
   */
  async downloadBenchmarkingData(params: any): Promise<any> {
    const res: any = await postRequest('/log/exportExcel', params);
    return res;
  },
  /**
   * 日志详情
   * @param params
   */
  async queryDetailsLog(params: any): Promise<any> {
    const res: any = await postRequest('/log/detail', params);
    return res;
  },
  /**
   * 项目名称下拉
   * @param params
   */
  async queryTenantCodeList() {
    const res = await postRequest('/log/queryTenantCodeList');
    return res;
  },
};

export default logManagement;
