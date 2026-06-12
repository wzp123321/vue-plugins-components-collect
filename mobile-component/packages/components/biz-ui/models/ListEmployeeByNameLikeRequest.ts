import PageParam from './PageParam';
export default class ListEmployeeByNameLikeRequest extends PageParam {
  // 组织id
  organizationId: string = '';
  // 员工姓名模糊匹配
  employeeNameLike: string = '';
}
