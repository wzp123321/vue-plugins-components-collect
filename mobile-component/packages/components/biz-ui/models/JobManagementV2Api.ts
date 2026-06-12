import JobAddRequest from './JobAddRequest';
import JobBaseRequest from './JobBaseRequest';
import JobDelRequest from './JobDelRequest';
import JobGroupAddRequest from './JobGroupAddRequest';
import JobGroupBaseRequest from './JobGroupBaseRequest';
import JobGroupDelRequest from './JobGroupDelRequest';
import JobGroupInfoVO from './JobGroupInfoVO';
import JobGroupTreeRequest from './JobGroupTreeRequest';
import JobGroupTreeVO from './JobGroupTreeVO';
import JobGroupUpdateRequest from './JobGroupUpdateRequest';
import JobInfoVO from './JobInfoVO';
import JobPageInfoVO from './JobPageInfoVO';
import JobPageRequest from './JobPageRequest';
import JobUpdateRequest from './JobUpdateRequest';
import PageResult from './PageResult';
import RestResult from './RestResult';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 岗位管理api
 */
export default class JobManagementV2Api {

	/**
	 * 删除岗位分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static deleteGroup(tenantId: string, body: JobGroupDelRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/deleteGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 删除岗位
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static deleteJob(tenantId: string, body: JobDelRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/deleteJob`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 根据岗位分组id查询岗位分组信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getGroupInfo(tenantId: string, body: JobGroupBaseRequest): Promise<RestResult<JobGroupInfoVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/getGroupInfo`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 根据岗位id查询岗位信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getJobInfo(tenantId: string, body: JobBaseRequest): Promise<RestResult<JobInfoVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/getJobInfo`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 岗位列表分页查询
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getJobPages(tenantId: string, body: JobPageRequest): Promise<RestResult<PageResult<JobPageInfoVO>>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/getJobPages`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 岗位分组懒加载树
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static getLazyGroupTree(tenantId: string, body: JobGroupTreeRequest): Promise<RestResult<JobGroupTreeVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/getLazyGroupTree`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 新建岗位分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static insertGroup(tenantId: string, body: JobGroupAddRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/insertGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 新建岗位
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static insertJob(tenantId: string, body: JobAddRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/insertJob`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 编辑岗位分组
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateGroup(tenantId: string, body: JobGroupUpdateRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/updateGroup`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 编辑岗位
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateJob(tenantId: string, body: JobUpdateRequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/job/updateJob`, body, {}).then((res) => {
			return res.data
		})
	}

}