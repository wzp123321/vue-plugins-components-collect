import DeptAddRequestVO from './DeptAddRequestVO';
import DeptDeleteRequestVO from './DeptDeleteRequestVO';
import DeptInfoVO from './DeptInfoVO';
import DeptPageRequestVO from './DeptPageRequestVO';
import DeptTreeRequestVO from './DeptTreeRequestVO';
import DeptTreeVO from './DeptTreeVO';
import DeptUpdateRequestVO from './DeptUpdateRequestVO';
import PageResult from './PageResult';
import RestResult from './RestResult';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 部门管理
 */
export default class DepartmentV2Api {

	/**
	 * 新建部门
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static add(tenantId: string, body: DeptAddRequestVO): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/department/add`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 删除部门
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static delete(tenantId: string, body: DeptDeleteRequestVO): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/department/delete`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 查询部门懒加载树
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static lazyTree(tenantId: string, body: DeptTreeRequestVO): Promise<RestResult<DeptTreeVO>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/department/lazyTree`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 分页查询部门列表
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static page(tenantId: string, body: DeptPageRequestVO): Promise<RestResult<PageResult<DeptInfoVO>>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/department/page`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 编辑部门
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static update(tenantId: string, body: DeptUpdateRequestVO): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/department/update`, body, {}).then((res) => {
			return res.data
		})
	}

}