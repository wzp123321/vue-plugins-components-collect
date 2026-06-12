import LocalDate from './LocalDate';
export default class UpdateResignationVORequest {
  // 员工id
  employeeId: Nullable<string>;
  // 离职日期
  resignDate: Nullable<LocalDate>;
  // 备注
  description: Nullable<string>;
}
