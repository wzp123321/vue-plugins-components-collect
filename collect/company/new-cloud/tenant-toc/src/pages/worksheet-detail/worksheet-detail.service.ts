import { postRequest } from '@/service/request';
const enum EPath {
  工单概览 = '/workOrder/queryOverviewOfMonth',
  工单分析 = '/workOrder/queryAnalyseOfMonth',
}
class WorksheetDetailService {
  public queryWorksheetDetailService = async (type: any, id: any): Promise<any> => {
    try {
      const res = await postRequest(EPath.工单分析, { workOrderType: type, tenantId: id });
      return res;
    } catch (error) {
      console.log('工单分析', '-->', error);
    }
  };

  public queryWorksheetDetailListService = async (type: any, id: any): Promise<any> => {
    try {
      const res = await postRequest(EPath.工单概览, { workOrderType: type, tenantId: id });
      return res;
    } catch (error) {
      console.log('工单概况', '-->', error);
    }
  };
}

export default new WorksheetDetailService();
