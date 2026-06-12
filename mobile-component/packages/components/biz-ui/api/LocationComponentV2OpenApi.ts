import LocationDetailQueryRequestDTO from '../models/LocationDetailQueryRequestDTO';
import LocationPathV2DetailResponseDTO from '../models/LocationPathV2DetailResponseDTO';
import LocationV2DetailRequestDTO from '../models/LocationV2DetailRequestDTO';
import LocationV2DetailResponseDTO from '../models/LocationV2DetailResponseDTO';
import LocationV2FuzzyRequestDTO from '../models/LocationV2FuzzyRequestDTO';
import LocationV2LazyTreeResponseDTO from '../models/LocationV2LazyTreeResponseDTO';
import LocationV2FuzzyPageRequestDTO from '../models/LocationV2FuzzyPageRequestDTO';
import RestResult from '../models/RestResult';
import PageResult from '../models/PageResult';

import HttpRequest from 'luch-request';

/**
 * 空间选择组件接口
 */
export default class LocationComponentV2OpenApi {
  /**
   * 空间组件：模糊搜索,返回列表
   *
   * @param tenantId
   * @param body
   */
  static fuzzyQueryForList(
    http: HttpRequest,
    tenantId: string,
    body: LocationV2FuzzyRequestDTO
  ): Promise<RestResult<LocationV2DetailResponseDTO[]>> {
    return http.post(`/hlms/openapi/portal/v2/${tenantId}/location/fuzzyQueryForList`, body, {}).then((res) => {
      if ((res as any).errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }

  /**
   * 空间组件：模糊搜索,返回分页列表
   *
   * @param tenantId
   * @param body
   */
  static fuzzyQueryForPage(
    http: HttpRequest,
    tenantId: string,
    body: LocationV2FuzzyPageRequestDTO
  ): Promise<RestResult<PageResult<LocationV2DetailResponseDTO>>> {
    return http.post(`/hlms/openapi/portal/v2/${tenantId}/location/fuzzyQueryForPage`, body, {}).then((res) => {
      if ((res as any).errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }

  /**
   * 空间组件：根据id查询路径节点信息,如编辑时初始渲染
   *
   * @param tenantId
   * @param body
   */
  static locationPathForDetail(
    http: HttpRequest,
    tenantId: string,
    body: LocationDetailQueryRequestDTO
  ): Promise<RestResult<LocationPathV2DetailResponseDTO[]>> {
    return http
      .post(`/hlms/openapi/portal/v2/${tenantId}/location/LocationPathDetailQueryForList`, body, {})
      .then((res) => {
        if ((res as any).errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 空间组件：级联查询各级列表或树
   *
   * @param tenantId
   * @param body
   */
  static queryLocationV2LazyTree(
    http: HttpRequest,
    tenantId: string,
    body: LocationV2DetailRequestDTO
  ): Promise<RestResult<LocationV2LazyTreeResponseDTO[]>> {
    return http.post(`/hlms/openapi/portal/v2/${tenantId}/location/queryLocationV2LazyTree`, body, {}).then((res) => {
      if ((res as any).errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
}
