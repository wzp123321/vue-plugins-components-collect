import { postRequest } from '@/service/request';

const MeasureLibrary = {
  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(
    params: MeasureLibrary.getListUrlParams
  ): Promise<HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<MeasureLibrary.tableDataSourceVO[]>>> {
    const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<MeasureLibrary.tableDataSourceVO[]>> =
      await postRequest('/energyManager/getEnergyManagerMeasureList', params);
    return res;
  },

  /**
   * 新增
   * @param params
   * @returns
   */
  async addurl(params: MeasureLibrary.addUrlParams) {
    const res = await postRequest('/energyManager/addEnergyManagerMeasure', params);
    return res;
  },

  /**
   * 修改
   * @param params
   * @returns
   */
  async updateUrl(params: MeasureLibrary.editUrlParams) {
    const res = await postRequest('/energyManager/updateEnergyManagerMeasure', params);
    return res;
  },

  /**
   * 删除数据
   * @param params
   * @returns
   */
  async deleteUrl(params: number) {
    const res = await postRequest('/energyManager/deleteEnergyManagerMeasure', params);
    return res;
  },

  /**
   * 导入
   * @param params 参数
   */
  async upload(params: number) {
    const res = await postRequest('/energyManager/uploadEnergyManagerMeasure', params);
    return res;
  },
};
export default MeasureLibrary;
