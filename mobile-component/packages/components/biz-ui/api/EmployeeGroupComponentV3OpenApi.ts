import EmployeeGroupCategoryComponentListItemDTO from '../models/EmployeeGroupCategoryComponentListItemDTO';
import EmployeeGroupCategoryComponentListQd from '../models/EmployeeGroupCategoryComponentListQd';
import EmployeeGroupComponentListItemDTO from '../models/EmployeeGroupComponentListItemDTO';
import EmployeeGroupComponentListQd from '../models/EmployeeGroupComponentListQd';
import EmployeeGroupComponentPageItemDTO from '../models/EmployeeGroupComponentPageItemDTO';
import EmployeeGroupComponentPageQd from '../models/EmployeeGroupComponentPageQd';
import PageResult from '../models/PageResult';
import RestResult from '../models/RestResult';

/**
 * 群组组件v3openapi
 */
export default class EmployeeGroupComponentV3OpenApi {
  /**
   * 查询群组类别列表
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeGroupCategoryForList(
    axiosInstance,
    tenantId: string,
    body: EmployeeGroupCategoryComponentListQd
  ): Promise<RestResult<EmployeeGroupCategoryComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryEmployeeGroupCategoryForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询群组列表（有数量限制）
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeGroupForList(
    axiosInstance,
    tenantId: string,
    body: EmployeeGroupComponentListQd
  ): Promise<RestResult<EmployeeGroupComponentListItemDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryEmployeeGroupForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 分页查询群组
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryEmployeeGroupForPage(
    axiosInstance,
    tenantId: string,
    body: EmployeeGroupComponentPageQd
  ): Promise<RestResult<PageResult<EmployeeGroupComponentPageItemDTO>>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v3/${tenantId}/component/personnelCenter/queryEmployeeGroupForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
