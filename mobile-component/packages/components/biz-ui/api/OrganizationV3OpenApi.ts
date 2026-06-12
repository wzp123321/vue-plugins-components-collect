import ApplicationBaseInfoDTO from '../models/ApplicationBaseInfoDTO';
import OrgQd from '../models/OrgQd';
import OrganizationApplicationInfoListQdDTO from '../models/OrganizationApplicationInfoListQdDTO';
import OrganizationApplicationListItemDTO from '../models/OrganizationApplicationListItemDTO';
import OrganizationApplicationListQdDTO from '../models/OrganizationApplicationListQdDTO';
import OrganizationCountQdDTO from '../models/OrganizationCountQdDTO';
import OrganizationInfoDTO from '../models/OrganizationInfoDTO';
import OrganizationInfoQdDTO from '../models/OrganizationInfoQdDTO';
import OrganizationListItemDTO from '../models/OrganizationListItemDTO';
import OrganizationListQdDTO from '../models/OrganizationListQdDTO';
import OrganizationProjectListItemDTO from '../models/OrganizationProjectListItemDTO';
import OrganizationProjectListQdDTO from '../models/OrganizationProjectListQdDTO';
import ProjectOrganizationListQdDTO from '../models/ProjectOrganizationListQdDTO';
import RestResult from '../models/RestResult';
import ShareOrganizationListQdDTO from '../models/ShareOrganizationListQdDTO';

/**
 * 组织架构开放接口
 */
export default class OrganizationV3OpenApi {
  /**
   * 查看组织架构详情
   *
   * @param tenantId
   * @param body
   */
  static getOrganizationById(
    axiosInstance,
    tenantId: string,
    body: OrganizationInfoQdDTO
  ): Promise<RestResult<OrganizationInfoDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/getOrganizationById`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询应用列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryApplicationForList(
    axiosInstance,
    tenantId: string,
    body: OrganizationApplicationInfoListQdDTO
  ): Promise<RestResult<ApplicationBaseInfoDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryApplicationForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询组织架构授权应用列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryOrganizationApplicationForList(
    axiosInstance,
    tenantId: string,
    body: OrganizationApplicationListQdDTO
  ): Promise<RestResult<OrganizationApplicationListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryOrganizationApplicationForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询组织架构数量
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryOrganizationCount(
    axiosInstance,
    tenantId: string,
    body: OrganizationCountQdDTO
  ): Promise<RestResult<number>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryOrganizationCount`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询组织架构列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryOrganizationForList(
    axiosInstance,
    tenantId: string,
    body: OrganizationListQdDTO
  ): Promise<RestResult<OrganizationListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryOrganizationForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 根据OrgQd查询组织架构列表
   *
   * @param tenantId
   * @param body
   */
  static queryOrganizationForListByOrgQd(
    axiosInstance,
    tenantId: string,
    body: OrgQd
  ): Promise<RestResult<OrganizationListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryOrganizationForListByOrgQd`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询组织架构授权院区列表
   *
   * @param tenantId
   * @param body
   */
  static queryOrganizationProjectForList(
    axiosInstance,
    tenantId: string,
    body: OrganizationProjectListQdDTO
  ): Promise<RestResult<OrganizationProjectListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryOrganizationProjectForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询院区的组织架构列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryProjectOrganizationForList(
    axiosInstance,
    tenantId: string,
    body: ProjectOrganizationListQdDTO
  ): Promise<RestResult<OrganizationListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryProjectOrganizationForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询共享组织架构列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryShareOrganizationForList(
    axiosInstance,
    tenantId: string,
    body: ShareOrganizationListQdDTO
  ): Promise<RestResult<OrganizationListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/sysConfig/organization/queryShareOrganizationForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
