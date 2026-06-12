import LabelComponentListItemDTO from '../models/LabelComponentListItemDTO';
import LabelComponentListQd from '../models/LabelComponentListQd';
import LabelComponentPageItemDTO from '../models/LabelComponentPageItemDTO';
import LabelComponentPageQd from '../models/LabelComponentPageQd';
import LabelGroupComponentListItemDTO from '../models/LabelGroupComponentListItemDTO';
import LabelGroupComponentListQd from '../models/LabelGroupComponentListQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

/**
 * 标签组件v3openapi
 */
export default class LabelComponentV3OpenApi {
  /**
   * 查询标签列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLabelForList(
    axiosInstance,
    tenantId: string,
    body: LabelComponentListQd
  ): Promise<RestResult<LabelComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryLabelForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询标签
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLabelForPage(
    axiosInstance,
    tenantId: string,
    body: LabelComponentPageQd
  ): Promise<RestResult<PageResult<LabelComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryLabelForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询标签分组列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLabelGroupForList(
    axiosInstance,
    tenantId: string,
    body: LabelGroupComponentListQd
  ): Promise<RestResult<LabelGroupComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryLabelGroupForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
