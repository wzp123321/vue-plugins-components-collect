import LabelDTO from '../models/LabelDTO';
import LabelGroupTreeNodeDTO from '../models/LabelGroupTreeNodeDTO';
import LabelGroupTreeQd from '../models/LabelGroupTreeQd';
import LabelQd from '../models/LabelQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

import { type AxiosInstance } from 'axios';

/**
 * 员工标签openApi
 */
export default class LabelV2OpenApi {
  /**
   * 分页查询标签
   * 分页查询（员工）标签
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLabelForPage(axiosInstance, tenantId: string, body: LabelQd): Promise<RestResult<PageResult<LabelDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryLabelForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询标签树
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLabelGroupForTree(
    axiosInstance,
    tenantId: string,
    body: LabelGroupTreeQd
  ): Promise<RestResult<LabelGroupTreeNodeDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryLabelGroupForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
