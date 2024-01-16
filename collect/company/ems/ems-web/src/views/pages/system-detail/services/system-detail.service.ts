import { postRequest } from '@/services/request';
// 系统明细
const systemDetailService = {
  /**
   * 获取系统列表
   * @returns
   */
  async getSystemList(): Promise<
    HttpRequestModule.ResTemplate<ISystemDetail.SystemInfo[]>
  > {
    const url = '/systemDetail/queryAllSystem';
    const res: HttpRequestModule.ResTemplate<ISystemDetail.SystemInfo[]> = await postRequest(
      url,
    );
    return res;
  },
  /**
   * 获取参数列表
   * @returns
   */
  async getSystemParamListBySystemId(params: {
    systemId: number;
    systemType: string;
  }): Promise<HttpRequestModule.ResTemplate<ISystemDetail.SystemParamInfo[]>> {
    const url = '/systemDetail/queryAllSystemParam';
    const res: HttpRequestModule.ResTemplate<ISystemDetail.SystemParamInfo[]> = await postRequest(
      url,
      params,
    );
    return res;
  },
  /**
   * 获取chart数据
   * @returns
   */
  async getSystemChart(
    params: ISystemDetail.QueryParams,
  ): Promise<HttpRequestModule.ResTemplate<ISystemDetail.SystemChartVO>> {
    const url = '/systemDetail/oneSystem/oneParam/lineChart/query';
    const res: HttpRequestModule.ResTemplate<ISystemDetail.SystemChartVO> = await postRequest(
      url,
      params,
    );
    return res;
  },
  /**
   * 获取表格数据
   * @returns
   */
  async getSystemTable(params: {
    startDate: string;
    endDate: string;
    systemId: number;
    systemType: string;
  }): Promise<HttpRequestModule.ResTemplate<ISystemDetail.SystemTableVO>> {
    const url = '/systemDetail/oneSystem/allParam/tableData/query';
    const res: HttpRequestModule.ResTemplate<ISystemDetail.SystemTableVO> = await postRequest(
      url,
      params,
    );
    return res;
  },
};

export default systemDetailService;
