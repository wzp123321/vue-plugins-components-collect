import RestResult from '../models/RestResult';
import UserDetailRequestDTO from '../models/UserDetailRequestDTO';
import UserDetailResponseDTO from '../models/UserDetailResponseDTO';
import HttpRequest from 'luch-request';
/**
 * 用户对外接口
 */
export default class UserV2OpenapiApi {
  /**
   * 根据用户id获取用户详情
   *
   * @param tenantId 租户id
   * @param body
   */
  static getUserDetailById(
    http: HttpRequest,
    tenantId: string,
    body: UserDetailRequestDTO
  ): Promise<RestResult<UserDetailResponseDTO>> {
    return http.post(`/hlms/openapi/portal/v2/${tenantId}/user/getUserDetailById`, body, {}).then((res) => {
      if ((res as any).errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
}
