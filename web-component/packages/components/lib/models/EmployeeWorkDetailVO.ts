import EmployeeWorkInfoVO from './EmployeeWorkInfoVO';
import IdName from './IdName';
export default class EmployeeWorkDetailVO extends EmployeeWorkInfoVO {
  // 员工编码
  workNo: Nullable<string>;
  // 员工类型
  staffTypeName: Nullable<string>;
  // 部门名称
  deptName: string = '';
  // 岗位名称
  jobName: Nullable<string>;
  // 职务名称
  titleName: Nullable<string>;
  // 直属上级姓名
  superiorName: Nullable<string>;
  // 标签信息
  labelInfoList: Nullable<IdName[]>;
}
