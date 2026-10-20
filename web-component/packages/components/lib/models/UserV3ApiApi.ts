import LoginRequestVO from './LoginRequestVO';
import LoginResponseVO from './LoginResponseVO';
import RestResult from './RestResult';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 用户V3接口
 */
export default class UserV3ApiApi {

	/**
	 * 用户注册登录V3
	 * 
	 * @param tenantId 
	 * @param body 
	 * @param terminal_id 
	 */
	static registerLogin(tenantId: string, body: LoginRequestVO, terminal_id: string): Promise<RestResult<LoginResponseVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v3/${tenantId}/user/registerLogin`, body, {
			headers: {
				terminal_id: terminal_id
			}
		}).then((res) => {
			return res.data
		})
	}

}