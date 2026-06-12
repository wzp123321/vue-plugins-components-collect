import EmployeeComponentListItemDTO from '../models/EmployeeComponentListItemDTO';
import EmployeeComponentListQd from '../models/EmployeeComponentListQd';
import EmployeeComponentPageItemDTO from '../models/EmployeeComponentPageItemDTO';
import EmployeeComponentPageQd from '../models/EmployeeComponentPageQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';
import { secretResponse } from '../common/secretResponse';

/**
 * 员工组件v3openapi
 */
export default class EmployeeComponentV3OpenApi {
  /**
   * 查询员工列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeForList(
    axiosInstance,
    tenantId: string,
    body: EmployeeComponentListQd
  ): Promise<RestResult<EmployeeComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryEmployeeForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          new secretResponse(res);
          return res;
        } else {
          new secretResponse(res.data);
          return res.data;
        }
      });
  }

  /**
   * 分页查询员工
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeForPage(
    axiosInstance,
    tenantId: string,
    body: EmployeeComponentPageQd
  ): Promise<RestResult<PageResult<EmployeeComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryEmployeeForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          new secretResponse(res);
          return res;
        } else {
          new secretResponse(res.data);
          return res.data;
        }
      });
  }
}
