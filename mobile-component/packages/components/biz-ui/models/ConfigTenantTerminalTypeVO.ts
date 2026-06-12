import ConfigTenantTerminalVO from './ConfigTenantTerminalVO';
export default class ConfigTenantTerminalTypeVO {
  // 终端类别id
  id: Nullable<string>;
  // 终端类别名称
  name: Nullable<string>;
  // 终端类别code
  code: Nullable<string>;
  // 终端列表
  terminals: Nullable<ConfigTenantTerminalVO[]>;
}
