import EmployeePersonalInfoVO from './EmployeePersonalInfoVO';
export default class EmployeePersonalDetailVO extends EmployeePersonalInfoVO {
  // 性别
  genderName: Nullable<string>;
  // 婚姻状况 1:未婚,2:已婚,3:离异,4:丧偶
  maritalStatusName: Nullable<string>;
  // 政治面貌 0:群众,1:共青团员,2:共产党员,3:其他
  politicsStatusName: Nullable<string>;
  // 学历类型 0:全日制,1:非全日制
  graduationTypeName: Nullable<string>;
}
