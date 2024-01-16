import { postRequest } from '@/services/request';

const nodeParameterService = {
  /**
   * 获取列表
   * @param params
   * @returns
   */
  async queryNodeParameterList(params: NodeParameterManage.ParameterQueryParams) {
    const reqUrl = '/admin/correlation/node/param/query';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 新增关联参数
   * @param params
   * @returns
   */
  async getNodeParameterAdd(params: NodeParameterManage.ParameterAddParams) {
    const reqUrl = '/admin/correlation/node/param/add';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 获取关联参数列表
   * @param params
   * @returns
   */
  async getNodeRelationTypeList() {
    const reqUrl = '/admin/correlation/node/param/queryType';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 删除关联参数列表
   * @param params
   * @returns
   */
  async getNodeParamterDelete(params: {
    id: number,
    paramType: number
  }) {
    const reqUrl = '/admin/correlation/node/param/delete';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 修改关联参数列表
   * @param params
   * @returns
   */
  async getNodeParameterUpdate(params: NodeParameterManage.ParameterUpdateParams) {
    const reqUrl = '/admin/correlation/node/param/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
};

export default nodeParameterService;
