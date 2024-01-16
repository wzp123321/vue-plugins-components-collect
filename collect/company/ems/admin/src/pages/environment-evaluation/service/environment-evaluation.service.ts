import { postRequest } from '@/services/request';

const environmentEvaluationService = {
  /**
   * 查询分页列表
   * @param params
   * @returns
   */
  async getEnvironmentEvaluationList(
    params: EnvironmentEvaluationModule.QueryParams,
  ) {
    const res = await postRequest(
      '/admin/config/queryAll/environment/evaluate/page',
      params,
    );
    return res;
  },
  /**
   * 查询所有列表
   * @param params
   * @returns
   */
  async getEnvironmentEvaluationAllList(
    params: EnvironmentEvaluationModule.QueryAllParams,
  ) {
    const res = await postRequest(
      '/admin/config/queryAll/environment/evaluate',
      params,
    );
    return res;
  },

  /**
   * 修改
   * @param params
   * @returns
   */
  async getEnvironmentEvaluationUpdate(
    params: EnvironmentEvaluationModule.UpdateParams,
  ) {
    const res = await postRequest(
      '/admin/config/update/environment/evaluate',
      params,
    );
    return res;
  },
};
export default environmentEvaluationService;
