import { postRequest } from '@/service/request';
import { MA_IMonthlyNodeUpdateParams } from '../ma-monthly-data.api';
class MonthlyDataService {
  /**
   * 查询月度数据列表
   * @param params 参数
   */
  public queryMonthlyDataList = async (params: MonthlyData.queryMonthlyDataList) => {
    const url = '/business/analyse/month/data/query';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 导入节点模板接口
   * @param params 参数
   */
  public uploadNode = async (params: any) => {
    const url = '/businessAnalyse/uploadNodeExcel';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 导入数据模板接口
   * @param params 参数
   */
  public uploadData = async (params: any) => {
    const url = '/businessAnalyse/uploadBusinessDataExcel';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 编辑月度明细表节点数据
   * @param params
   * @returns
   */
  public updateMonthlyNodeData = async (params: MA_IMonthlyNodeUpdateParams) => {
    const url = '/businessAnalyse/updateBusinessData';
    const res = await postRequest(url, params);
    return res;
  };
}

export default new MonthlyDataService();
