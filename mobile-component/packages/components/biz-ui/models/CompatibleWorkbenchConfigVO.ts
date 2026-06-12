import AppInstancesInGroupVO from './AppInstancesInGroupVO';
export default class CompatibleWorkbenchConfigVO {
  // 分组id
  groupId: Nullable<string>;
  // 分组名称
  groupName: Nullable<string>;
  // 分组下的应用实例
  appInstancesInGroupVOList: Nullable<AppInstancesInGroupVO[]>;
}
