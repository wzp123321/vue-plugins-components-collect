import DepartmentDTO from '../models/DepartmentDTO';
import DepartmentForSyncDTO from '../models/DepartmentForSyncDTO';
import DepartmentQd from '../models/DepartmentQd';
import DepartmentTreeNodeDTO from '../models/DepartmentTreeNodeDTO';
import DepartmentTreeQuery from '../models/DepartmentTreeQuery';
import DeptBasicDTO from '../models/DeptBasicDTO';
import DeptByIdsRequest from '../models/DeptByIdsRequest';
import ListDepartmentForSyncRequest from '../models/ListDepartmentForSyncRequest';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

import HttpRequest from 'luch-request';

/**
 * 部门openApi
 */
export default class DepartmentV2OpenApi {
  /**
   * 根据部门id批量获取部门信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static getDepartmentListByIds(
    http: HttpRequest,
    tenantId: string,
    body: DeptByIdsRequest
  ): Promise<RestResult<DeptBasicDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/department/queryListByIds`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
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
   * @param http
   * @param tenantId
   * @param body
   */
  static queryDepartmentForPage(
    http: HttpRequest,
    tenantId: string,
    body: DepartmentQd
  ): Promise<RestResult<PageResult<DepartmentDTO>>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForPage`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
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
   * @param http
   * @param tenantId
   * @param body
   */
  static queryDepartmentForSync(
    http: HttpRequest,
    tenantId: string,
    body: ListDepartmentForSyncRequest
  ): Promise<RestResult<DepartmentForSyncDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForSync`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
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
   * @param http
   * @param tenantId
   * @param body
   */
  static queryDepartmentForTree(
    http: HttpRequest,
    tenantId: string,
    body: DepartmentTreeQuery
  ): Promise<RestResult<DepartmentTreeNodeDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForTree`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
