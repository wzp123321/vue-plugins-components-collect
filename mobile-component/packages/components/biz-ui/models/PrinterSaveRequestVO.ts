export default class PrinterSaveRequestVO {
	// 打印机id
	id: Nullable<string>;
	// 是否启用：0-不启用 1-启用
	enable: Nullable<boolean>;
	// 租户Id
	tenantId: Nullable<string>;
}