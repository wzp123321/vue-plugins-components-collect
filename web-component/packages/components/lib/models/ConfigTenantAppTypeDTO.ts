import ConfigTenantAppDTO from './ConfigTenantAppDTO';
export default class ConfigTenantAppTypeDTO {
  // 应用类别名称
  typeName: Nullable<string>;
  // 工作台应用
  children: Nullable<ConfigTenantAppDTO[]>;
}
