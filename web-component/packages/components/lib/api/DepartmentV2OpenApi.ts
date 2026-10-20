import DepartmentDTO from '../models/DepartmentDTO';
import DepartmentDetailDTO from '../models/DepartmentDetailDTO';
import DepartmentDetailQd from '../models/DepartmentDetailQd';
import DepartmentForSyncDTO from '../models/DepartmentForSyncDTO';
import DepartmentQd from '../models/DepartmentQd';
import DepartmentTreeNodeDTO from '../models/DepartmentTreeNodeDTO';
import DepartmentTreeQuery from '../models/DepartmentTreeQuery';
import ListDepartmentForSyncRequest from '../models/ListDepartmentForSyncRequest';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

/**
 * 部门openApi
 */
export default class DepartmentV2OpenApi {
  /**
   * 查询部门信息
   * 查询部门信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForDetail(
    axiosInstance,
    tenantId: string,
    body: DepartmentDetailQd
  ): Promise<RestResult<DepartmentDetailDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForDetail`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询部门信息
   * 分页查询部门信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForPage(
    axiosInstance,
    tenantId: string,
    body: DepartmentQd
  ): Promise<RestResult<PageResult<DepartmentDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询部门信息
   * 主数据同步查询接口
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForSync(
    axiosInstance,
    tenantId: string,
    body: ListDepartmentForSyncRequest
  ): Promise<RestResult<DepartmentForSyncDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForSync`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询部门树
   * 查询部门树
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentForTree(
    axiosInstance,
    tenantId: string,
    body: DepartmentTreeQuery
  ): Promise<RestResult<DepartmentTreeNodeDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
