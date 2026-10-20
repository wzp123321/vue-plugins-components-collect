import ConfigTenantAppRequest from './ConfigTenantAppRequest';
export default class ConfigTenantAppTypeRequest {
  // 应用类别名称
  typeName: Nullable<string>;
  // 工作台应用
  children: Nullable<ConfigTenantAppRequest[]>;
}
