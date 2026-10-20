import JumpInfo from './JumpInfo';
import { CustomPageTypeEnum } from './CustomPageTypeEnum';
export default class CustomPageDefinition {
  // 产品模块id
  productId: Nullable<string>;
  // 业务分类编码
  businessCategoryCode: Nullable<string>;
  // 业务界面编码，在业务分类下唯一
  code: Nullable<string>;
  // 业务界面名称
  name: Nullable<string>;
  // 业务界面类型
  type: Nullable<CustomPageTypeEnum>;
  // 跳转信息列表
  jumpInfos: Nullable<JumpInfo[]>;
}
