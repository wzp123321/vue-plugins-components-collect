import { postRequest } from '@/service/request';
import { ESM_AddRequest, ESM_EnergyCodeVO } from '../../energy-saving-management.api';
enum EPath {
  新增节能量管理 = 'energySaving/add',
  查询能源类型 = 'baseHead/queryEnergyType',
}
class EsmAddService {
  /**
   * 新增节能量管理
   */
  public queryTableData = async (params: ESM_AddRequest): Promise<HttpRequestModule.ResTemplate<any>> => {
    const res = await postRequest(EPath.新增节能量管理, params);
    return res;
  };

  /**
   * 查询能源类型
   */

  public queryEnergyType = async (
    params: GeneralModule.TenantVO,
  ): Promise<HttpRequestModule.ResTemplate<ESM_EnergyCodeVO[]>> => {
    const res = postRequest(EPath.查询能源类型, params);
    return res;
  };
}

export default new EsmAddService();
