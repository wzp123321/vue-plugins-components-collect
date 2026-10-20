import ConfigTenantAppCenterVO from './ConfigTenantAppCenterVO';
import ConfigTenantAppTypeVO from './ConfigTenantAppTypeVO';
import ConfigTenantBasicInfoVO from './ConfigTenantBasicInfoVO';
import ConfigTenantMobileTerminalAppCenterVO from './ConfigTenantMobileTerminalAppCenterVO';
import ConfigTenantSafeVO from './ConfigTenantSafeVO';
import ConfigTenantWebLoginVO from './ConfigTenantWebLoginVO';
import ConfigTenantWebOtherVO from './ConfigTenantWebOtherVO';
export default class AggregatedTenantInfoVO {
  // 工作台应用及类别
  configTenantAppTypeVO: Nullable<ConfigTenantAppTypeVO>;
  // 租户安全配置
  configTenantSafeVO: Nullable<ConfigTenantSafeVO>;
  // 移动端天溯应用中心配置
  configTenantMobileTerminalAppCenterVO: Nullable<ConfigTenantMobileTerminalAppCenterVO>;
  // 工作台登陆页配置
  configTenantWebLoginVO: Nullable<ConfigTenantWebLoginVO>;
  // 工作台其他配置
  configTenantWebOtherVO: Nullable<ConfigTenantWebOtherVO>;
  // 工作台天溯应用中心配置
  configTenantAppCenterVO: Nullable<ConfigTenantAppCenterVO>;
  // 租户基础信息
  configTenantBasicInfoVO: Nullable<ConfigTenantBasicInfoVO>;
}
