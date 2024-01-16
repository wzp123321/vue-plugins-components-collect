import { postRequest } from '@/services/request';

// 所有的请求
const basicParamConfigService = {
  
  /**
   * 查询分页列表
   * @param params
   * @returns
   */
  async getBasicParamConfigList(params: BasicParamConfigModule.QueryParams) {
    const res = await postRequest('/admin/environment/parameter/config/query', params);
    return res;
  },

  /**
   * 删除数据
   * @param params
   * @returns
   */
    async getBasicParamConfigDelete(params: BasicParamConfigModule.DeleteParams) {
    const reqUrl = '/admin/environment/parameter/config/delete';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 新增
   * @param params
   * @returns
   */
  async getBasicParamConfigCreate(params: any) {
    const reqUrl = '/admin/environment/parameter/config/create';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 修改
   * @param params
   * @returns
   */
  async getBasicParamConfigUpdate(params: BasicParamConfigModule.UpdateParams) {
    const reqUrl = '/admin/environment/parameter/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 季节列表
   * @param params
   * @returns
   */
  async getSeasonList(){
    const reqUrl = '/admin/environment/parameter/season/list';
    const res = await postRequest(reqUrl);
    return res;
  },
}
export default basicParamConfigService;
