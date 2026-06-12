import { PrintTemplateComponentValueTypeEnum } from './PrintTemplateComponentValueTypeEnum';

export default class ValueItem {
  // 数据内容值类型
  type: Nullable<PrintTemplateComponentValueTypeEnum>;
  // 固定值
  fixedValue: Nullable<string>;
  // 业务字段/系统字段key
  fieldKey: Nullable<string>;
  // 编码映射方案id
  assetDefSchemeId: Nullable<string>;
  // 示例值
  exampleValue: Nullable<string>;
}
