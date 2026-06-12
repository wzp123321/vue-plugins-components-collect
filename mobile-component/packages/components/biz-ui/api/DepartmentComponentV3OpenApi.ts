import DepartmentComponentListItemDTO from '../models/DepartmentComponentListItemDTO';
import DepartmentComponentListQd from '../models/DepartmentComponentListQd';
import DepartmentComponentPageItemDTO from '../models/DepartmentComponentPageItemDTO';
import DepartmentComponentPageQd from '../models/DepartmentComponentPageQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

/**
 * 部门组件v3openapi
 */
export default class DepartmentComponentV3OpenApi {
  /**
   * 查询部门列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForList(
    axiosInstance,
    tenantId: string,
    body: DepartmentComponentListQd
  ): Promise<RestResult<DepartmentComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryDepartmentForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询部门
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForPage(
    axiosInstance,
    tenantId: string,
    body: DepartmentComponentPageQd
  ): Promise<RestResult<PageResult<DepartmentComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryDepartmentForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
