import ConfigTenantAppVO from './ConfigTenantAppVO';
export default class ConfigTenantAppTypeVO {
  // 应用类别名称
  typeName: Nullable<string>;
  // 工作台应用
  children: Nullable<ConfigTenantAppVO[]>;
}
