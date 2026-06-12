import { BindingValueTypeEnum } from './BindingValueTypeEnum';
import { MarketCodeSystemFieldEnum } from './MarketCodeSystemFieldEnum';
export default class VariableBinding {
  // 变量名
  variableName: Nullable<string>;
  // 绑定值类型
  bindingValueType: Nullable<BindingValueTypeEnum>;
  // 绑定值
  bindingValue: Nullable<string>;
  // 绑定的系统字段，当绑定值类型为系统字段时使用
  systemField: Nullable<MarketCodeSystemFieldEnum>;
}
