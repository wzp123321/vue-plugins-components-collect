import EmployeePersonalDetailVO from './EmployeePersonalDetailVO';
import EmployeeQualificationVO from './EmployeeQualificationVO';
import EmployeeResignationVO from './EmployeeResignationVO';
import EmployeeWorkDetailVO from './EmployeeWorkDetailVO';
export default class EmployeeDetailVO {
  //
  employeeId: Nullable<string>;
  //
  organizationName: Nullable<string>;
  //
  state: Nullable<string>;
  // 是否离职：true-离职，false-在职
  resigned: Nullable<boolean>;
  // 个人信息
  personalInfo: Nullable<EmployeePersonalDetailVO>;
  // 工作信息
  workInfo: Nullable<EmployeeWorkDetailVO>;
  // 资质信息
  qualificationInfo: Nullable<EmployeeQualificationVO>;
  // 离职信息
  resignationInfo: Nullable<EmployeeResignationVO>;
}
