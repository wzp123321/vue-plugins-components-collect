import { postRequest } from '@/services/request';

enum KQC_EPATH {
  getListUrl = '/kpiquota/query', // 获取列表数据
  deleteUrl = '/kpiquota/delete', // 删除
  addUrl = '/kpiquota/add', // 新增
  updateUrl = '/kpiquota/update', // 修改
  downloadKpiQuotaTemplate = '/kpiquota/downloadKpiQuotaTemplate', // 下载KPI定额数据模板
  uploadKpiQuota = '/kpiquota/uploadKpiQuota', // 批量导入KPI定额数据
  queryKpiTypeAndQuotaType = '/kpiquota/queryKpiTypeAndQuotaType', // 展示KPI类型与定额类型
}

const KPIQuota = {
  /**
   * 获取列表
   * @param params
   * @returns
   */
  async getListUrl(params: kpiQuotaRequest.getListUrlType) {
    const res = await postRequest(KQC_EPATH.getListUrl, params);
    return res;
  },
  /**
   * 新增
   * @param params
   * @returns
   */
  async add(params: any) {
    const res = await postRequest(KQC_EPATH.addUrl, params);
    return res;
  },

  /**
   * 删除
   * @param params
   * @returns
   */
  async delete(params: number) {
    const res = await postRequest(KQC_EPATH.deleteUrl, params);
    return res;
  },
  /**
   * 修改关联参数列表
   * @param params
   * @returns
   */
  async update(params: any) {
    const res = await postRequest(KQC_EPATH.updateUrl, params);
    return res;
  },
  /**
   * 修改关联参数列表
   * @param params
   * @returns
   */
  async importData(params: any) {
    const res = await postRequest(KQC_EPATH.uploadKpiQuota, params);
    return res;
  },
  /**
   * 获取KPI类型
   * @param params
   * @returns
   */
  async queryKpiTypeAndQuotaType() {
    const res = await postRequest(KQC_EPATH.queryKpiTypeAndQuotaType);
    return res;
  },
  /**
   * 导入
   * @param params
   */
  async getDeviceList(params: any) {
    const res: any = await postRequest('/kpiquota/uploadKpiQuota', params);
    return res;
  },
};

export default KPIQuota;
