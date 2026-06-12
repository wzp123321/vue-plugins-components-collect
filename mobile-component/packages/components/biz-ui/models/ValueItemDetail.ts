import { PrintTemplateComponentValueTypeEnum } from './PrintTemplateComponentValueTypeEnum';
export default class ValueItemDetail {
  // 参数类型
  type: Nullable<PrintTemplateComponentValueTypeEnum>;
  // 参数key
  key: Nullable<string>;
  // 参数值
  value: Nullable<string>;
}
