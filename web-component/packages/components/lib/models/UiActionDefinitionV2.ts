import JumpInfo from './JumpInfo';
import { UiActionTypeEnum } from './UiActionTypeEnum';
export default class UiActionDefinitionV2 {
  // 界面动作编码，在业务分类下唯一
  code: Nullable<string>;
  // 界面动作名称
  name: Nullable<string>;
  // 界面动作类型
  type: Nullable<UiActionTypeEnum>;
  // 跳转信息列表
  jumpInfos: Nullable<JumpInfo[]>;
}
