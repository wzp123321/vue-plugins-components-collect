import ConfigTenantAppCenterRequest from './ConfigTenantAppCenterRequest';
import ConfigTenantAppTypeRequest from './ConfigTenantAppTypeRequest';
import ConfigTenantBasicInfoRequest from './ConfigTenantBasicInfoRequest';
import ConfigTenantMobileTerminalAppCenterRequest from './ConfigTenantMobileTerminalAppCenterRequest';
import ConfigTenantSafeRequest from './ConfigTenantSafeRequest';
import ConfigTenantWebLoginRequest from './ConfigTenantWebLoginRequest';
import ConfigTenantWebOtherRequest from './ConfigTenantWebOtherRequest';
export default class AggregatedTenantInfoRequest {
  // 工作台应用及类别
  configTenantAppTypeRequest: Nullable<ConfigTenantAppTypeRequest>;
  // 租户安全配置
  configTenantSafeRequest: Nullable<ConfigTenantSafeRequest>;
  // 移动端天溯应用中心配置
  configTenantMobileTerminalAppCenterRequest: Nullable<ConfigTenantMobileTerminalAppCenterRequest>;
  // 工作台登陆页配置
  configTenantWebLoginRequest: Nullable<ConfigTenantWebLoginRequest>;
  // 工作台其他配置
  configTenantWebOtherRequest: Nullable<ConfigTenantWebOtherRequest>;
  // 工作台天溯应用中心配置
  configTenantAppCenterRequest: Nullable<ConfigTenantAppCenterRequest>;
  // 租户基础信息
  configTenantBasicInfoRequest: Nullable<ConfigTenantBasicInfoRequest>;
}
