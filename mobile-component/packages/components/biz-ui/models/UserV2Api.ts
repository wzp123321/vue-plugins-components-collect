import EmployeeOrgVO from './EmployeeOrgVO';
import ImageCaptchaVO from './ImageCaptchaVO';
import ImageCaptchaVORequest from './ImageCaptchaVORequest';
import MyCenterVOResponse from './MyCenterVOResponse';
import RegisterLoginVORequest from './RegisterLoginVORequest';
import RegisterLoginVOResponse from './RegisterLoginVOResponse';
import RegisterVORequest from './RegisterVORequest';
import ResetPwdVORequest from './ResetPwdVORequest';
import RestResult from './RestResult';
import SendSmsVORequest from './SendSmsVORequest';
import SsoRedirectRequestVO from './SsoRedirectRequestVO';
import SsoRedirectResponseVO from './SsoRedirectResponseVO';
import SwitchUserOrganizationVORequest from './SwitchUserOrganizationVORequest';
import UserInfoVOResponse from './UserInfoVOResponse';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 用户管理中心
 */
export default class UserV2Api {

	/**
	 * 获取图片验证码
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getCaptcha(tenantId: string, body: ImageCaptchaVORequest): Promise<RestResult<ImageCaptchaVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/getCaptcha`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 获取用户信息
	 * 
	 * @param tenantId 
	 */
	static getUserInfo(tenantId: string): Promise<RestResult<UserInfoVOResponse>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/getUserInfo`, null, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 用户登出
	 * 
	 * @param tenantId 
	 */
	static logout(tenantId: string): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/logout`, null, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 个人中心
	 * 
	 * @param tenantId 
	 */
	static myCenter(tenantId: string): Promise<RestResult<MyCenterVOResponse>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/myCenter`, null, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 注册用户
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static register(tenantId: string, body: RegisterVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/register`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 用户注册登录
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static registerLogin(tenantId: string, body: RegisterLoginVORequest): Promise<RestResult<RegisterLoginVOResponse>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/registerLogin`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 修改密码
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static resetPassword(tenantId: string, body: ResetPwdVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/resetPwd`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 获取短信验证码
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static sendSmsCode(tenantId: string, body: SendSmsVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/sendSmsCode`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 单点登录跳转到应用
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static ssoRedirect(tenantId: string, body: SsoRedirectRequestVO): Promise<RestResult<SsoRedirectResponseVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/ssoRedirect`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 切换用户选择的当前组织
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static switchUserOrg(tenantId: string, body: SwitchUserOrganizationVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/setUserOrganization`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 查询用户所有组织
	 * 
	 * @param tenantId 
	 */
	static userOrgList(tenantId: string): Promise<RestResult<EmployeeOrgVO[]>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/user/getUserOrganizationList`, null, {}).then((res) => {
			return res.data
		})
	}

}