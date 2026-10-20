import LocalDate from './LocalDate';
export default class EmployeeResignationVO {
  // 离职日期
  resignDate: Nullable<LocalDate>;
  // 离职备注
  description: Nullable<string>;
}
