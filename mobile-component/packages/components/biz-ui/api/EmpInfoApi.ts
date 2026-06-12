import Request from 'luch-request';
import RestResult from '../models/RestResult';
import EmployeeBasicDT0 from '../models/EmployeeBasicDT0';
import EmployeeByIdsRequest from '../models/EmployeeByIdsRequest';

export default class EmpInfoApi {
  /**
   * 根据员工id批量获取员工工作信息
   * @param http
   * @param tenantId
   * @param body
   */
  static getEmployeeBasicInfoByIds(
    http: Request,
    tenantId: string,
    body: EmployeeByIdsRequest
  ): Promise<RestResult<EmployeeBasicDT0[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeBasicInfoByIds`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
