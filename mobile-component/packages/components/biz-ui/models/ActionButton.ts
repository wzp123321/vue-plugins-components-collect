import BusinessAction from './BusinessAction';
import ProcessAction from './ProcessAction';
import UiActionDefinition from './UiActionDefinition';
import UiActionDefinitionV2 from './UiActionDefinitionV2';
export default class ActionButton {
  // 操作按钮编码
  code: Nullable<string>;
  // 操作按钮名称
  name: Nullable<string>;
  // 操作按钮样式
  style: Nullable<string>;
  // 流程动作
  processAction: Nullable<ProcessAction>;
  // 业务动作
  businessAction: Nullable<BusinessAction>;
  // 界面动作
  uiAction: Nullable<UiActionDefinition>;
  // 界面动作V2
  uiActionV2: Nullable<UiActionDefinitionV2>;
}
