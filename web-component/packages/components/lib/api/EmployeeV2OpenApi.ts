import DepartmentManagerDTO from '../models/DepartmentManagerDTO';
import DepartmentManagerDetailDTO from '../models/DepartmentManagerDetailDTO';
import DepartmentManagerDetailQd from '../models/DepartmentManagerDetailQd';
import DepartmentManagerQd from '../models/DepartmentManagerQd';
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

/**
 * 员工openApi
 */
export default class EmployeeV2OpenApi {
  /**
   * 查询员工的部门主管信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static getDepartmentManagerForDetail(
    axiosInstance,
    tenantId: string,
    body: DepartmentManagerDetailQd
  ): Promise<RestResult<DepartmentManagerDetailDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/getDepartmentManagerForDetail`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 根据员工id批量获取员工工作信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static getEmployeeBasicInfoByIds(
    axiosInstance,
    tenantId: string,
    body: EmployeeByIdsRequest
  ): Promise<RestResult<EmployeeBasicDT0[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeBasicInfoByIds`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 根据用户id和组织id获取未删除的员工基础信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static getEmployeeBasicInfoByUserIds(
    axiosInstance,
    tenantId: string,
    body: EmployeeByUserRequest
  ): Promise<RestResult<EmployeeBasicDT0[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeBasicInfoByUserIds`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询单个员工信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static getEmployeeById(axiosInstance, tenantId: string, body: GetEmployeeRequest): Promise<RestResult<EmployeeDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/getEmployeeById`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 根据用户id和组织id获取员工工作信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static getEmployeeWorkInfoByUserId(
    axiosInstance,
    tenantId: string,
    body: EmployeeWorkInfoByUserRequest
  ): Promise<RestResult<EmployeeWorkInfoDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnel/employee/getEmployeeWorkInfoByUserId`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询部门主管信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryDepartmentManagerForPage(
    axiosInstance,
    tenantId: string,
    body: DepartmentManagerQd
  ): Promise<RestResult<PageResult<DepartmentManagerDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentManagerForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
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
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeForPage(
    axiosInstance,
    tenantId: string,
    body: EmployeeQd
  ): Promise<RestResult<PageResult<EmployeeDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryEmployeeForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询员工信息
   * 主数据同步查询接口
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeForSync(
    axiosInstance,
    tenantId: string,
    body: ListEmployeeForSyncRequest
  ): Promise<RestResult<EmployeeForSyncDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryEmployeeForSync`, body, {})
      .then((res) => {
        if (res.errcode) {
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
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryUserEmployeeForSync(
    axiosInstance,
    tenantId: string,
    body: QueryUserEmployeeForSyncRequest
  ): Promise<RestResult<UserEmployeeForSyncDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryUserEmployeeForSync`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
