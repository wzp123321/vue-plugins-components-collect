import { postRequest } from '@/service/request';
import { ESM_UpdateRequest, ESM_UpdateMeasureNameRequest } from '../../../energy-saving-management.api';
enum EPath {
  编辑表格数据 = 'energySaving/update',
  编辑措施名称 = 'energySaving/measureNameUpdate',
  编辑措施备注 = 'energySaving/measureRemarksUpdate',
  删除管理措施 = 'energySaving/delete',
}
class EsmTTableService {
  /**
   * 编辑表格数据(数据)
   */
  public updateTableData = async (params: ESM_UpdateRequest): Promise<HttpRequestModule.ResTemplate<any>> => {
    const res = await postRequest(EPath.编辑表格数据, params);
    return res;
  };

  /**
   * 编辑措施名称
   */
  public updateMeasureName = async (
    params: ESM_UpdateMeasureNameRequest,
  ): Promise<HttpRequestModule.ResTemplate<any>> => {
    const res = await postRequest(EPath.编辑措施名称, params);
    return res;
  };

  // 编辑备注
  public updateRemark = async (params: any) => {
    const res = await postRequest(EPath.编辑措施备注, params);
    return res;
  };

  // 删除措施
  public deleteManageMeasure = async (params: any) => {
    const res = await postRequest(EPath.删除管理措施, params);
    return res;
  };
}

export default new EsmTTableService();
