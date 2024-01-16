import { postRequest } from '@/services/request';
import { ParameterQueryParams, ParameterAddParams, ParameterUpdateParams } from '../ra-global-parameter-manage.api';

const globalParameterService = {
  /**
   * 获取列表
   * @param params
   * @returns
   */
  async queryParameterList(params: ParameterQueryParams) {
    const reqUrl = '/admin/correlation/param/query';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 新增关联参数
   * @param params
   * @returns
   */
  async getGlobalParameterAdd(params: ParameterAddParams) {
    const reqUrl = '/admin/correlation/param/add';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 获取能源编码列表
   * @param params
   * @returns
   */
  async getEnergyList() {
    const reqUrl = '/admin/energy/code/listBy';
    const res = await postRequest(reqUrl, { energyFlag: '0' });
    return res;
  },
  /**
   * 获取关联参数列表
   * @param params
   * @returns
   */
  async getQueryCorrelationParamTypeNameList() {
    const reqUrl = '/admin/correlation/param/type/list';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 删除关联参数列表
   * @param params
   * @returns
   */
  async getGlobalParamterDelete(params: { id: number; paramType: number }) {
    const reqUrl = '/admin/correlation/param/delete';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 修改关联参数列表
   * @param params
   * @returns
   */
  async getGlobalParameterUpdate(params: ParameterUpdateParams) {
    const reqUrl = '/admin/correlation/param/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 获取列表
   * @param params
   * @returns
   */
  async getAssociateDeviceList(params: { standardPointCode: string }) {
    const reqUrl = '/admin/correlation/device/query';
    const res = await postRequest(reqUrl, params);
    return res;
  },
};

export default globalParameterService;
