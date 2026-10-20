import ConfigTenantAppCenterDTO from './ConfigTenantAppCenterDTO';
import ConfigTenantAppTypeDTO from './ConfigTenantAppTypeDTO';
import ConfigTenantBasicInfoDTO from './ConfigTenantBasicInfoDTO';
import ConfigTenantMobileTerminalAppCenterDTO from './ConfigTenantMobileTerminalAppCenterDTO';
import ConfigTenantSafeDTO from './ConfigTenantSafeDTO';
import ConfigTenantWebLoginDTO from './ConfigTenantWebLoginDTO';
import ConfigTenantWebOtherDTO from './ConfigTenantWebOtherDTO';
export default class AggregatedTenantInfoDTO {
  // 工作台应用及类别
  configTenantAppTypeDTO: Nullable<ConfigTenantAppTypeDTO>;
  // 租户安全配置
  configTenantSafeDTO: Nullable<ConfigTenantSafeDTO>;
  // 移动端天溯应用中心配置
  configTenantMobileTerminalAppCenterDTO: Nullable<ConfigTenantMobileTerminalAppCenterDTO>;
  // 工作台登陆页配置
  configTenantWebLoginDTO: Nullable<ConfigTenantWebLoginDTO>;
  // 工作台其他配置
  configTenantWebOtherDTO: Nullable<ConfigTenantWebOtherDTO>;
  // 工作台天溯应用中心配置
  configTenantAppCenterDTO: Nullable<ConfigTenantAppCenterDTO>;
  // 租户基础信息
  configTenantBasicInfoDTO: Nullable<ConfigTenantBasicInfoDTO>;
}
