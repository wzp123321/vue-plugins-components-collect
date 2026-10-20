import PageParam from './PageParam';
export default class ListEmployeeByPhoneRequest extends PageParam {
  // 组织id
  organizationId: string = '';
  // 员工手机号等于..
  phoneEq: string = '';
}
