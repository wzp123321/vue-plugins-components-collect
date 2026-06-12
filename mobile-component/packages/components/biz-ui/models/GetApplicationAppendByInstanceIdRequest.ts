import AppInstanceIdRequest from './AppInstanceIdRequest';
// 根据应用实例id查询应用实例扩展信息
export default class GetApplicationAppendByInstanceIdRequest extends AppInstanceIdRequest {
  // 终端id
  terminalId: string = '';
}
