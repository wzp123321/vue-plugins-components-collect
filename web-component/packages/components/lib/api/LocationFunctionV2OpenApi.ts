import FunctionListResponseDTO from '../models/FunctionListResponseDTO';
import FunctionPropertyTreeNodeDTO from '../models/FunctionPropertyTreeNodeDTO';
import FunctionPropertyTreeQueryDTO from '../models/FunctionPropertyTreeQueryDTO';
import LocationFunctionListRequestDTO from '../models/LocationFunctionListRequestDTO';
import RestResult from '../models/RestResult';

/**
 * 空间功能属性查询开放接口
 */
export default class LocationFunctionV2OpenApi {
  /**
   * 空间属性树查询
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryFunctionPropertyForTree(
    axiosInstance,
    tenantId: string,
    body: FunctionPropertyTreeQueryDTO
  ): Promise<RestResult<FunctionPropertyTreeNodeDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/location/functionProperty/queryFunctionPropertyForTree`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询空间关联的功能属性信息
   *
   * @param axiosInstance
   * @param tenantId
   * @param body
   */
  static queryLocFunctionForList(
    axiosInstance,
    tenantId: string,
    body: LocationFunctionListRequestDTO
  ): Promise<RestResult<FunctionListResponseDTO[]>> {
    return axiosInstance
      .post(`/hlms/openapi/portal/v2/${tenantId}/location/queryLocFunctionForList`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
}
