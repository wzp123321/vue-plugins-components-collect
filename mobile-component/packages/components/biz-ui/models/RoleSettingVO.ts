// 角色其他设置
export default class RoleSettingVO {
	/**
	 * 是否永久有效
	 * true:永久有效,false:非永久有效
	 */
	permanentlyValid: Nullable<boolean>;
	/**
	 * 生效日期
	 * 形如 yyyy-MM-dd HH:mm
	 */
	effectiveDate: Nullable<string>;
	/**
	 * 到期日期
	 * 形如 yyyy-MM-dd HH:mm
	 */
	expirationDate: Nullable<string>;
}