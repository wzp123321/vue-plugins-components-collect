import PageResult from './PageResult';
import RestResult from './RestResult';
import TitleAddRequest from './TitleAddRequest';
import TitleBaseRequest from './TitleBaseRequest';
import TitleGroupAddRequest from './TitleGroupAddRequest';
import TitleGroupBaseRequest from './TitleGroupBaseRequest';
import TitleGroupInfoVO from './TitleGroupInfoVO';
import TitleGroupTreeRequest from './TitleGroupTreeRequest';
import TitleGroupTreeVO from './TitleGroupTreeVO';
import TitleGroupUpdateRequest from './TitleGroupUpdateRequest';
import TitleInfoVO from './TitleInfoVO';
import TitlePageInfoVO from './TitlePageInfoVO';
import TitlePageRequest from './TitlePageRequest';
import TitleUpdateRequest from './TitleUpdateRequest';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 职务管理
 */
export default class TitleManagementV2Api {

	/**
	 * 删除职务分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static deleteGroup(tenantId: string, body: TitleGroupBaseRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/deleteGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 删除职务
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static deleteTitle(tenantId: string, body: TitleBaseRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/deleteTitle`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 根据职务分组id查询职务分组信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getGroupInfo(tenantId: string, body: TitleGroupBaseRequest): Promise<RestResult<TitleGroupInfoVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/getGroupInfo`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 职务分组加载树
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getLazyGroupTree(tenantId: string, body: TitleGroupTreeRequest): Promise<RestResult<TitleGroupTreeVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/getLazyGroupTree`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 根据职务id查询职务信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getTitleInfo(tenantId: string, body: TitleBaseRequest): Promise<RestResult<TitleInfoVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/getTitleInfo`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 职务列表查询
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getTitlePages(tenantId: string, body: TitlePageRequest): Promise<RestResult<PageResult<TitlePageInfoVO>>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/getTitlePages`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 新建职务分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static insertGroup(tenantId: string, body: TitleGroupAddRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/insertGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 新建职务
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static insertTitle(tenantId: string, body: TitleAddRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/insertTitle`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 编辑职务分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateGroup(tenantId: string, body: TitleGroupUpdateRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/updateGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 编辑职务
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateTitle(tenantId: string, body: TitleUpdateRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/title/updateTitle`, body, {}).then((res) => {
			return res.data
		})
	}

}