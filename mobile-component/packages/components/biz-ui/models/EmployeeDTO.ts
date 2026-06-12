import CodeName from './CodeName';
import EmployeeDepartmentDTO from './EmployeeDepartmentDTO';
import EmployeeJobDTO from './EmployeeJobDTO';
import EmployeeOrganizationDTO from './EmployeeOrganizationDTO';
import EmployeeTenantDTO from './EmployeeTenantDTO';
import EmployeeTitleDTO from './EmployeeTitleDTO';
import LabelMinimumDTO from './LabelMinimumDTO';
import PhoneDTO from './PhoneDTO';
import UserMinimumDTO from './UserMinimumDTO';
// 员工信息
export default class EmployeeDTO {
  // 员工id
  id: Nullable<string>;
  // 员工姓名
  name: Nullable<string>;
  // 工号
  staffId: Nullable<string>;
  // 短号
  shortCode: Nullable<string>;
  // 电子邮箱
  email: Nullable<string>;
  // 头像地址
  picUrl: Nullable<string>;
  // 在职状态（离职/在职）
  onBoardStatus: Nullable<string>;
  // 所属租户
  tenant: Nullable<EmployeeTenantDTO>;
  // 所属组织
  organization: Nullable<EmployeeOrganizationDTO>;
  // 所属部门
  department: Nullable<EmployeeDepartmentDTO>;
  // 所属岗位
  job: Nullable<EmployeeJobDTO>;
  // 所属职务
  title: Nullable<EmployeeTitleDTO>;
  // 标签
  label: Nullable<LabelMinimumDTO[]>;
  // 关联用户
  user: Nullable<UserMinimumDTO>;
  // 手机号
  phone: Nullable<PhoneDTO>;
  // 考勤方式
  attendanceMethod: Nullable<CodeName[]>;
}
