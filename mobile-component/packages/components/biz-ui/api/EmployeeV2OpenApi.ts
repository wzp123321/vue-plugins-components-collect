import EmployeeBasicDT0 from '../models/EmployeeBasicDT0';
import EmployeeByIdsRequest from '../models/EmployeeByIdsRequest';
import EmployeeByUserRequest from '../models/EmployeeByUserRequest';
import EmployeeDTO from '../models/EmployeeDTO';
import EmployeeForSyncDTO from '../models/EmployeeForSyncDTO';
import EmployeeQd from '../models/EmployeeQd';
import EmployeeWorkInfoByUserRequest from '../models/EmployeeWorkInfoByUserRequest';
import EmployeeWorkInfoDTO from '../models/EmployeeWorkInfoDTO';
import GetEmployeeRequest from '../models/GetEmployeeRequest';
import ListEmployeeForSyncRequest from '../models/ListEmployeeForSyncRequest';
import PageResult from '../models/PageResult';
import QueryUserEmployeeForSyncRequest from '../models/QueryUserEmployeeForSyncRequest';
import RestResult from '../models/RestResult';
import UserEmployeeForSyncDTO from '../models/UserEmployeeForSyncDTO';
import { secretResponse } from '../common/secretResponse';
import HttpRequest from 'luch-request';

/**
 * 员工openApi
 */
export default class EmployeeV2OpenApi {
  /**
   * 根据员工id批量获取员工工作信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static getEmployeeBasicInfoByIds(
    http: HttpRequest,
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

  /**
   * 根据用户id和组织id获取未删除的员工基础信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static getEmployeeBasicInfoByUserIds(
    http: HttpRequest,
    tenantId: string,
    body: EmployeeByUserRequest
  ): Promise<RestResult<EmployeeBasicDT0[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeBasicInfoByUserIds`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询单个员工信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static getEmployeeById(
    http: HttpRequest,
    tenantId: string,
    body: GetEmployeeRequest
  ): Promise<RestResult<EmployeeDTO>> {
    return http.post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/getEmployeeById`, body, {}).then((res) => {
      if ((res as any).errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }

  /**
   * 根据用户id和组织id获取员工工作信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static getEmployeeWorkInfoByUserId(
    http: HttpRequest,
    tenantId: string,
    body: EmployeeWorkInfoByUserRequest
  ): Promise<RestResult<EmployeeWorkInfoDTO>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeWorkInfoByUserId`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询员工信息
   * 分页查询员工信息
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static queryEmployeeForPage(
    http: HttpRequest,
    tenantId: string,
    body: EmployeeQd
  ): Promise<RestResult<PageResult<EmployeeDTO>>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryEmployeeForPage`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          new secretResponse(res as any);
          return res;
        } else {
          new secretResponse(res.data);
          return res.data;
        }
      });
  }

  /**
   * 查询员工信息
   * 主数据同步查询接口
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static queryEmployeeForSync(
    http: HttpRequest,
    tenantId: string,
    body: ListEmployeeForSyncRequest
  ): Promise<RestResult<EmployeeForSyncDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryEmployeeForSync`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询员工信息
   * loginName迁移查询接口
   *
   * @param http
   * @param tenantId
   * @param body
   */
  static queryUserEmployeeForSync(
    http: HttpRequest,
    tenantId: string,
    body: QueryUserEmployeeForSyncRequest
  ): Promise<RestResult<UserEmployeeForSyncDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryUserEmployeeForSync`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
