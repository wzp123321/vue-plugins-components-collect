import { postRequest } from '@/services/request';

const benchMarkingSystem = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: benchMarkingSystemHttp.getListUrlType) {
    const res = await postRequest('/admin/benchmarking/system/query', params);
    return res;
  },
  /**
   * 删除数据
   * @param params
   * @returns
   */
  async deleteUrl(params: benchMarkingSystemHttp.deleteUrlType) {
    const res = await postRequest('/admin/benchmarking/system/delete', params);
    return res;
  },
  /**
   * 获取对标体系列表
   * @param params
   * @returns
   */
  async queryListUrl() {
    const res = await postRequest('/admin/benchmarking/system/list');
    return res;
  },

  /**
   * 新增
   * @param params
   * @returns
   */
  async addurl(params: any) {
    const res = await postRequest('/admin/benchmarking/system/create', params);
    return res;
  },
  /**
   * 修改
   * @param params
   * @returns
   */
  async updateUrl(params: any) {
    const res = await postRequest('/admin/benchmarking/system/update', params);
    return res;
  },
};

export default benchMarkingSystem;
