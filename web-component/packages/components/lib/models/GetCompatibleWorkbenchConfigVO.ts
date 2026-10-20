import AppInstancesInGroupVO from './AppInstancesInGroupVO';
// 查询工作台的应用分组及分组下的应用入口信息
export default class GetCompatibleWorkbenchConfigVO {
  // 分组id
  groupId: Nullable<string>;
  // 分组名称
  groupName: Nullable<string>;
  // 分组下的应用实例
  appInstancesInGroupVOList: Nullable<AppInstancesInGroupVO[]>;
}
