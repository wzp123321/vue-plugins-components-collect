import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';
import TitleComponentListItemDTO from '../models/TitleComponentListItemDTO';
import TitleComponentListQd from '../models/TitleComponentListQd';
import TitleComponentPageItemDTO from '../models/TitleComponentPageItemDTO';
import TitleComponentPageQd from '../models/TitleComponentPageQd';
import TitleGroupComponentListItemDTO from '../models/TitleGroupComponentListItemDTO';
import TitleGroupComponentListQd from '../models/TitleGroupComponentListQd';

/**
 * 职务组件v3openapi
 */
export default class TitleComponentV3OpenApi {
  /**
   * 查询职务列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryTitleForList(
    axiosInstance,
    tenantId: string,
    body: TitleComponentListQd
  ): Promise<RestResult<TitleComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryTitleForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询职务
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryTitleForPage(
    axiosInstance,
    tenantId: string,
    body: TitleComponentPageQd
  ): Promise<RestResult<PageResult<TitleComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryTitleForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询职务分组列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryTitleGroupForList(
    axiosInstance,
    tenantId: string,
    body: TitleGroupComponentListQd
  ): Promise<RestResult<TitleGroupComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryTitleGroupForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
