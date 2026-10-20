import GetProcessDiagramRequestDTO from '../../../models/GetProcessDiagramRequestDTO';
import GetProcessInstanceActivityLogRequestDTO from '../../../models/GetProcessInstanceActivityLogRequestDTO';
import ProcessDiagramDTO from '../../../models/ProcessDiagramDTO';
import ProcessInstanceActivityLogDTO from '../../../models/ProcessInstanceActivityLogDTO';
import RestResult from '../../../models/RestResult';
import GetTaskDetailRequestDTO from '../../../models/GetTaskDetailRequestDTO';
import TaskDetailDTO from '../../../models/TaskDetailDTO';
import CompleteTaskRequestDTO from '../../../models/CompleteTaskRequestDTO';
import EmployeeQd from '../../../models/EmployeeQd';
import EmployeeDTO from '../../../models/EmployeeDTO';
import DepartmentDetailDTO from '../../../models/DepartmentDetailDTO';
import DepartmentDetailQd from '../../../models/DepartmentDetailQd';
import QueryActionInfoRequestDTO from '../../../models/QueryActionInfoRequestDTO';
import ActionInfo from '../../../models/ActionInfo';
import TaskDetailListQdDTO from '../../../models/TaskDetailListQdDTO';
import FormInstanceDTO from '../../../models/FormInstanceDTO';
import QueryFormInstanceRequestDTO from '../../../models/QueryFormInstanceRequestDTO';
import PageResult from '../../../models/PageResult';
import DepartmentDTO from '../../../models/DepartmentDTO';
import DepartmentQd from '../../../models/DepartmentQd';
import CustomPageInfoDTO from '../../../models/CustomPageInfoDTO';
import CustomPageInfoRequestDTO from '../../../models/CustomPageInfoRequestDTO';
/**
 * 流程实例相关的开放接口
 */
export default class WorkflowApi {
  /**
	 * 根据业务界面主键查询详情
	 * 
	 * @param body 
	 */
	public static getCustomPageInfoById(axios: any,body: CustomPageInfoRequestDTO): Promise<RestResult<CustomPageInfoDTO>> {
		return axios.post(`/hlms/openapi/portal/v2/sysConfig/application/product/customPage/getCustomPageInfoById`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
		})
	}
  /**
   * 文件上传接口
   *
   * @param tenantId
   * @param module
   * @param file
   * @param filePath
   * @param isCovered
   * @param is2pdf
   */
  public static upload(axios: any, tenantId: string, body: FormData): Promise<RestResult<any[]>> {
    return axios.post(`/hlms/api/filecenter/v2/${tenantId}/upload`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }

  /**
   * 分页查询部门信息
   * 分页查询部门信息
   *
   * @param tenantId
   * @param body
   */
  public static queryDepartmentForPage(
    axios: any,
    tenantId: string,
    body: DepartmentQd
  ): Promise<RestResult<PageResult<DepartmentDTO>>> {
    return axios
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
  /**
   * 查询表单实例
   *
   * @param tenantId
   * @param body
   */
  public static queryFormInstance(
    axios: any,
    tenantId: string,
    body: QueryFormInstanceRequestDTO
  ): Promise<RestResult<FormInstanceDTO>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/form/queryFormInstance`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
  /**
   * 批量查询任务详情
   *
   * @param tenantId
   * @param body
   */
  static queryTaskDetailForList(
    axios: any,
    tenantId: string,
    body: TaskDetailListQdDTO
  ): Promise<RestResult<TaskDetailDTO[]>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/task/queryTaskDetailForList`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
  /**
   * 查询操作按钮信息
   *
   * @param tenantId
   * @param body
   */
  static queryActionInfo(
    axios: any,
    tenantId: string,
    body: QueryActionInfoRequestDTO
  ): Promise<RestResult<ActionInfo>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/task/queryActionInfo`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
  /**
   * 根据部门id获取部门信息
   *
   * @param tenantId
   * @param body
   */
  static queryDepartmentForDetail(
    axios: any,
    tenantId: string,
    body: DepartmentDetailQd
  ): Promise<RestResult<DepartmentDetailDTO>> {
    return axios
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryDepartmentForDetail`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
  /**
   * 根据员工id批量获取员工工作信息
   *
   * @param tenantId
   * @param body
   */
  static queryEmployeeForPage(
    axios: any,
    tenantId: string,
    body: EmployeeQd
  ): Promise<RestResult<PageResult<EmployeeDTO>>> {
    return axios
      .post(`/hlms/openapi/portal/v2/${tenantId}/personnelCenter/queryEmployeeForPage`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }
  /**
   * 查询流程图
   *
   * @param tenantId
   * @param body
   */
  public static getProcessDiagram(
    axios: any,
    tenantId: string,
    body: GetProcessDiagramRequestDTO
  ): Promise<RestResult<ProcessDiagramDTO>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/getProcessDiagram`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }

  /**
   * 查询流程实例执行日志
   *
   * @param tenantId
   * @param body
   */
  public static getProcessInstanceActivityLog(
    axios: any,
    tenantId: string,
    body: GetProcessInstanceActivityLogRequestDTO
  ): Promise<RestResult<ProcessInstanceActivityLogDTO>> {
    return axios
      .post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/getProcessInstanceActivityLog`, body, {})
      .then((res) => {
        if (res.errcode) {
          return res;
        } else {
          return res.data;
        }
      });
  }

  /**
   * 查询任务详情
   *
   * @param tenantId
   * @param body
   */
  public static getTaskDetail(
    axios: any,
    tenantId: string,
    body: GetTaskDetailRequestDTO
  ): Promise<RestResult<TaskDetailDTO>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/task/getTaskDetail`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
  /**
   * 完成任务
   *
   * @param tenantId
   * @param body
   */
  static handleTask(axios: any, tenantId: string, body: CompleteTaskRequestDTO): Promise<RestResult<void>> {
    return axios.post(`/hlms/openapi/workflowv2/v1/${tenantId}/task/handleTask`, body, {}).then((res) => {
      if (res.errcode) {
        return res;
      } else {
        return res.data;
      }
    });
  }
}
