import JobDTO from '../models/JobDTO';
import JobGroupTreeNodeDTO from '../models/JobGroupTreeNodeDTO';
import JobGroupTreeQd from '../models/JobGroupTreeQd';
import JobQd from '../models/JobQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

import { type AxiosInstance } from 'axios';

/**
 * 岗位openApi
 */
export default class JobV2OpenApi {
  /**
   * 分页查询岗位
   * 分页查询岗位
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryJobForPage(axiosInstance, tenantId: string, body: JobQd): Promise<RestResult<PageResult<JobDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryJobForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 岗位类别全量树
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryJobGroupForTree(
    axiosInstance,
    tenantId: string,
    body: JobGroupTreeQd
  ): Promise<RestResult<JobGroupTreeNodeDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryJobGroupForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
