import EmployeePersonalInfoVO from './EmployeePersonalInfoVO';
import EmployeeQualificationVO from './EmployeeQualificationVO';
import EmployeeWorkInfoVO from './EmployeeWorkInfoVO';
export default class AddEmployeeVORequest {
  // 个人信息
  personalInfo: Nullable<EmployeePersonalInfoVO>;
  // 工作信息
  workInfo: Nullable<EmployeeWorkInfoVO>;
  // 资质信息
  qualificationInfo: Nullable<EmployeeQualificationVO>;
}
