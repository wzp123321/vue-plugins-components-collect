import AppInstanceOptionVO from './AppInstanceOptionVO';
export default class AppInstanceOptionGroupVO {
  // 分组名称
  name: Nullable<string>;
  // 分组下的应用实例
  appInstances: Nullable<AppInstanceOptionVO[]>;
}
