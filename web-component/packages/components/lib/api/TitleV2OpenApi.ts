import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';
import TitleDTO from '../models/TitleDTO';
import TitleGroupTreeNodeDTO from '../models/TitleGroupTreeNodeDTO';
import TitleGroupTreeQd from '../models/TitleGroupTreeQd';
import TitleQd from '../models/TitleQd';

import { type AxiosInstance } from 'axios';

/**
 * 职务openApi
 */
export default class TitleV2OpenApi {
  /**
   * 分页查询职务
   * 分页查询职务
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryTitleForPage(axiosInstance, tenantId: string, body: TitleQd): Promise<RestResult<PageResult<TitleDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryTitleForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 职务类别全量树
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryTitleGroupForTree(
    axiosInstance,
    tenantId: string,
    body: TitleGroupTreeQd
  ): Promise<RestResult<TitleGroupTreeNodeDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryTitleGroupForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
