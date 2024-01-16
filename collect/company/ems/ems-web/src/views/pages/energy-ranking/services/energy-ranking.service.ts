import { postRequest } from '@/services/request';

const EnergyRankingService = {
  /**
   * 获取能耗排名数据
   * @param params
   * @returns
   */
  async getEnergyRankingList(
    params: EnergyRankingModule.EnergyRankingQueryParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyRankingModule.EnergyAnalyseRankData>> {
    const res: HttpRequestModule.ResTemplate<EnergyRankingModule.EnergyAnalyseRankData> = await postRequest(
      '/energyRank/queryEnergyRank',
      params,
    );
    return res;
  },

  /**
   * 根据分组id批量查询树列表
   * @param params
   * @returns
   */
  async getTreeListInGroup(params: number[]): Promise<HttpRequestModule.ResTemplate<number[]>> {
    const reqUrl = '/admin/abnormal/group/queryTreeIdByGroupIdList';
    const res: HttpRequestModule.ResTemplate<number[]> = await postRequest(reqUrl, params);
    return res;
  },
};

export default EnergyRankingService;
