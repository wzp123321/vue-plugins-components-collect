import IdName from './IdName';
import PhoneDTO from './PhoneDTO';
export default class DepartmentManagerDTO extends IdName {
  // 部门负责人通讯手机号
  phone: Nullable<PhoneDTO>;
}
