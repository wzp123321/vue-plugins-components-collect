import GroupedProjectTreeRequestDTO from '../models/GroupedProjectTreeRequestDTO';
import ProjectGroupTreeNodeDTO from '../models/ProjectGroupTreeNodeDTO';
import ProjectListDTO from '../models/ProjectListDTO';
import ProjectListRequestDTO from '../models/ProjectListRequestDTO';
import ProjectSelectorStyleDTO from '../models/ProjectSelectorStyleDTO';
import ProjectSelectorStyleRequestDTO from '../models/ProjectSelectorStyleRequestDTO';
import RestResult from '../models/RestResult';

/**
 * 项目OpenApi接口
 */
export default class ProjectComponentV2OpenApiController {
  /**
   * 查询项目选择器样式
   *
   * @param tenantId
   * @param body
   */
  static getProjectSelectorStyle(
    axiosInstance,
    tenantId: string,
    body: ProjectSelectorStyleRequestDTO
  ): Promise<RestResult<ProjectSelectorStyleDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/sysConfig/project/getProjectSelectorStyle`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询租户下的项目分组树
   *
   * @param tenantId
   * @param body
   */
  static queryGroupedProjectForTree(
    axiosInstance,
    tenantId: string,
    body: GroupedProjectTreeRequestDTO
  ): Promise<RestResult<ProjectGroupTreeNodeDTO>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/sysConfig/project/queryGroupedProjectForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询租户下的项目列表
   *
   * @param tenantId
   * @param body
   */
  static queryProjectForList(
    axiosInstance,
    tenantId: string,
    body: ProjectListRequestDTO
  ): Promise<RestResult<ProjectListDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/sysConfig/project/queryProjectForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
