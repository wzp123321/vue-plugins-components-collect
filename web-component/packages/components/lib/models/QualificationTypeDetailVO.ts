import IdName from './IdName';
import Option from './Option';
export default class QualificationTypeDetailVO {
  // 资质类型ID
  id: Nullable<string>;
  // 资质类型名称
  name: Nullable<string>;
  // 关联岗位
  jobs: Nullable<IdName[]>;
  // 到期提醒人
  recipientTypes: Nullable<Option[]>;
  // 描述
  description: Nullable<string>;
}
