import CreateProcessInstanceRequestDTO from './CreateProcessInstanceRequestDTO';
import GetProcessDiagramRequestDTO from './GetProcessDiagramRequestDTO';
import GetProcessInstanceActivityLogRequestDTO from './GetProcessInstanceActivityLogRequestDTO';
import ProcessDiagramDTO from './ProcessDiagramDTO';
import ProcessInstanceActivityLogDTO from './ProcessInstanceActivityLogDTO';
import RestResult from './RestResult';
import StopProcessInstanceRequestDTO from './StopProcessInstanceRequestDTO';
import { ApiClientFactory } from '@hlms/common-front';

/**
 * 流程实例相关的开放接口
 */
export default class ProcessInstanceV1OpenApi {
  /**
   * 创建流程实例
   *
   * @param tenantId
   * @param body
   */
  static createProcessInstance(tenantId: string, body: CreateProcessInstanceRequestDTO): Promise<RestResult<string>> {
    return ApiClientFactory.client()
      .post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/createProcessInstance`, body, {})
      .then((res) => {
        return res.data;
      });
  }

  /**
   * 查询流程图
   *
   * @param tenantId
   * @param body
   */
  static getProcessDiagram(
    tenantId: string,
    body: GetProcessDiagramRequestDTO
  ): Promise<RestResult<ProcessDiagramDTO>> {
    return ApiClientFactory.client()
      .post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/getProcessDiagram`, body, {})
      .then((res) => {
        return res.data;
      });
  }

  /**
   * 查询流程实例执行日志
   *
   * @param tenantId
   * @param body
   */
  static getProcessInstanceActivityLog(
    tenantId: string,
    body: GetProcessInstanceActivityLogRequestDTO
  ): Promise<RestResult<ProcessInstanceActivityLogDTO>> {
    return ApiClientFactory.client()
      .post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/getProcessInstanceActivityLog`, body, {})
      .then((res) => {
        return res.data;
      });
  }

  /**
   * 终止流程实例
   *
   * @param tenantId
   * @param body
   */
  static stopProcessInstance(tenantId: string, body: StopProcessInstanceRequestDTO): Promise<RestResult<void>> {
    return ApiClientFactory.client()
      .post(`/hlms/openapi/workflowv2/v1/${tenantId}/process/stopProcessInstance`, body, {})
      .then((res) => {
        return res.data;
      });
  }
}
