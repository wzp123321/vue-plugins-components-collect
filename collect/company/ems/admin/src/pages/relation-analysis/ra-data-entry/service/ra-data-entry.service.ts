import { postRequest } from '@/services/request';

const dataEntryServie = {
  /**
   * 获取头部表单
   * @param params
   * @returns
   */
  async getParamInitialDataById(params: { paramId: number }) {
    const res = await postRequest('/admin/correlation/param/detail', params);
    return res;
  },
  /**
   * 查询单日累入 数据列表
   * @param params
   * @returns
   */
  async getSingleDataList(params: DataEntryModule.DataEntryQueryParams) {
    const res: any = await postRequest('/admin/correlation/single/data/query', params);
    return res;
  },

  /**
   * 单值累计新增
   * @param params
   * @returns
   */
  async createSingleDataListUrl(params: DataEntryModule.SingleDataForm) {
    const res = await postRequest('/admin/correlation/single/data/create', params);
    return res;
  },
  /**
   * 单日累计 删除
   * @param params
   * @returns
   */
  async batchSingleDataDelete(params: DataEntryModule.SingleDataDeleteParams) {
    const res = await postRequest('/admin/correlation/single/data/batchDelete', params);
    return res;
  },
  /**
   * 单日累计 修改
   * @param params
   * @returns
   */
  async updateSingleDataListUrl(params: DataEntryModule.SingleDataUpdateParams) {
    const res = await postRequest('/admin/correlation/single/data/update', params);
    return res;
  },

  /**
   * 查询值差型 数据列表
   * @param params
   * @returns
   */
  async getDifferenceDataList(params: DataEntryModule.DataEntryQueryParams) {
    const res = await postRequest('/admin/correlation/data/difference/query', params);
    return res;
  },
  /**
   * 增 值差型
   * @param params
   * @returns
   */
  async getDifferenceDataCreate(params: DataEntryModule.DifferenceDataCreateForm) {
    const res = await postRequest('/admin/correlation/data/difference/create', params);
    return res;
  },
  /**
   * 删除 值差型
   * @param params
   * @returns
   */
  async batchValueDelete(params: DataEntryModule.DifferenceDataDeleteBatch) {
    const res = await postRequest('/admin/correlation/data/difference/batchDelete', params);
    return res;
  },
  /**
   * 修改 值差型
   * @param params
   * @returns
   */
  async getDifferenceDataUpdate(params: DataEntryModule.DifferenceDataUpdateForm) {
    const res = await postRequest('/admin/correlation/data/difference/update', params);
    return res;
  },
  /**
   * 查询 时差型
   * @param params
   * @returns
   */
  async getDifferenceDateList(params: DataEntryModule.DifferenceDateQueryParams) {
    const res = await postRequest('/admin/correlation/date/difference/query', params);
    return res;
  },
  /**
   * 删除 值差型
   * @param params
   * @returns
   */
  async batchHourDelete(params: DataEntryModule.DifferenceDateDeleteParams) {
    const res = await postRequest('/admin/correlation/date/difference/batchDelete', params);
    return res;
  },
  /**
   * 修改 值差型
   * @param params
   * @returns
   */
  async getDifferenceDateUpdate(params: DataEntryModule.DifferenceDateUpdateParams) {
    const res = await postRequest('/admin/correlation/date/difference/update', params);
    return res;
  },
  /**
   * 增 时差型
   * @param params
   * @returns
   */
  async getDifferenceCreate(params: DataEntryModule.DifferenceDataCreateForm) {
    const res = await postRequest('/admin/correlation/date/difference/create', params);
    return res;
  },
};

export default dataEntryServie;
