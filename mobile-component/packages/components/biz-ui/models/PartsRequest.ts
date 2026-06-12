export default class PartsRequest {
	/**
	 * 类别列表-TenantInfo→ConfigTenantInfoSimpleDTO\VO 租户基础信息
	 * TenantSafe→ConfigTenantSafeDTO\VO 租户安全配置
	 * TenantWebLogin→ConfigTenantWebLoginDTO\VO 工作台登陆页配置
	 * TenantWebOther→ConfigTenantWebOtherDTO\VO 工作台其他配置
	 * TenantAppCenter→ConfigTenantAppCenterDTO\VO 工作台天溯应用中心配置
	 * TenantMobileTerminalAppCenter→TenantMobileTerminalAppCenterDTO\VO 移动端天溯应用中心配置
	 * TenantAppType→ConfigTenantAppTypeDTO\VO 工作台应用
	 */
	parts: Nullable<string[]>;
}