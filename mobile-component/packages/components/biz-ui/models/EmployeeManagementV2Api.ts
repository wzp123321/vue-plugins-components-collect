import AddEmployeeVORequest from './AddEmployeeVORequest';
import CodeName from './CodeName';
import DeleteEmployeeVORequest from './DeleteEmployeeVORequest';
import EmployeeListItemVO from './EmployeeListItemVO';
import PageResult from './PageResult';
import RestResult from './RestResult';
import SaveEmployeePersonalVORequest from './SaveEmployeePersonalVORequest';
import SaveEmployeeWorkVORequest from './SaveEmployeeWorkVORequest';
import SearchEmployeeVORequest from './SearchEmployeeVORequest';
import SearchSuperiorVORequest from './SearchSuperiorVORequest';
import SuperiorEmployeeVO from './SuperiorEmployeeVO';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 员工管理
 */
export default class EmployeeManagementV2Api {

	/**
	 * 新建员工
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static addEmployee(tenantId: string, body: AddEmployeeVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/addEmployee`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 删除员工
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static deleteEmployee(tenantId: string, body: DeleteEmployeeVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/deleteEmployee`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 获取员工类型列表
	 * 
	 * @param tenantId 
	 */
	static listStaffType(tenantId: string): Promise<RestResult<CodeName[]>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/listStaffType`, null, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 员工列表查询
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static searchEmployee(tenantId: string, body: SearchEmployeeVORequest): Promise<RestResult<PageResult<EmployeeListItemVO>>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/searchEmployee`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 查询上级列表
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static searchSuperiors(tenantId: string, body: SearchSuperiorVORequest): Promise<RestResult<SuperiorEmployeeVO[]>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/searchSuperiors`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 修改个人信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateEmployeePersonal(tenantId: string, body: SaveEmployeePersonalVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/updateEmployeePersonal`, body, {}).then((res) => {
			return res.data
		})
	}

	/**
	 * 修改工作信息
	 * 
	 * @param tenantId 
	 * @param body 
	 */
	static updateEmployeeWork(tenantId: string, body: SaveEmployeeWorkVORequest): Promise<RestResult<void>> {
		return ApiClientFactory.client().post(`/hlms/api/portal/v2/${tenantId}/personnel/employeeManagement/updateEmployeeWork`, body, {}).then((res) => {
			return res.data
		})
	}

}