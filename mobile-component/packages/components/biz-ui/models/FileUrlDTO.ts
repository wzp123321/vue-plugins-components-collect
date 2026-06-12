export default class FileUrlDTO {
	// 转换前的入库路径
	originalUrl: Nullable<string>;
	// 转换后的访问路径
	displayUrl: Nullable<string>;
	// 签名过期时间，单位为秒（为空则默认7天）
	expire: Nullable<number>;
}