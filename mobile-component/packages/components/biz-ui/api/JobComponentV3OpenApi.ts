import JobComponentListItemDTO from '../models/JobComponentListItemDTO';
import JobComponentListQd from '../models/JobComponentListQd';
import JobComponentPageItemDTO from '../models/JobComponentPageItemDTO';
import JobComponentPageQd from '../models/JobComponentPageQd';
import JobGroupComponentListItemDTO from '../models/JobGroupComponentListItemDTO';
import JobGroupComponentListQd from '../models/JobGroupComponentListQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

/**
 * 岗位组件v3openapi
 */
export default class JobComponentV3OpenApi {
  /**
   * 查询岗位列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryJobForList(
    axiosInstance,
    tenantId: string,
    body: JobComponentListQd
  ): Promise<RestResult<JobComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryJobForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询岗位
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryJobForPage(
    axiosInstance,
    tenantId: string,
    body: JobComponentPageQd
  ): Promise<RestResult<PageResult<JobComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryJobForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询岗位分组列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryJobGroupForList(
    axiosInstance,
    tenantId: string,
    body: JobGroupComponentListQd
  ): Promise<RestResult<JobGroupComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryJobGroupForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
