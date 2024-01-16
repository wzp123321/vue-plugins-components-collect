import { postRequest } from '@/service/request';
import { ESM_QueryListRequest, ESM_QueryListResponse } from '../../energy-saving-management.api';
enum EPath {
  查询表格数据 = 'energySaving/queryList',
}
class EsmTableService {
  /**
   * name
   */
  public queryTableData = async (
    params: ESM_QueryListRequest
  ): Promise<HttpRequestModule.ResTemplate<ESM_QueryListResponse>> => {
    const res = await postRequest(EPath.查询表格数据, params);
    return res;
  };
}

export default new EsmTableService();
