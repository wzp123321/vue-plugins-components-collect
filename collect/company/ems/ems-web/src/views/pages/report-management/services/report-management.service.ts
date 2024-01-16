import url from '@/api/api-url';
import { postRequest } from '@/services/request';

const reportManagement = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: reportManagementHttp.getListUrlType) {
    const res = await postRequest(url.reportManagement.queryListUrl, params);
    return res;
  },

  /**
   * 删除
   * @param params
   * @returns
   */
  async deleteUser(params: reportManagementHttp.deleteUrlType) {
    const res = await postRequest(url.reportManagement.deleteUrl, params);
    return res;
  },

  /**
   * 上传
   * @param params
   */
  async uploadReportData(params: any) {
    const res: any = await postRequest(
      url.reportManagement.uploadExcelReportData,
      params,
    );
    return res;
  },
};

export default reportManagement;
