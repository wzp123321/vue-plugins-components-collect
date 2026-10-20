export default class UploadFileConfigRequestVO {
	// 上传文件相关配置id
	id: Nullable<string>;
	// 功能编码
	code: Nullable<string>;
	// 文件类型，逗号分割（示例：png,jpg,doc）
	fileType: Nullable<string>;
	// 文件大小限制
	fileSizeLimit: Nullable<number>;
	// 
	tenantId: Nullable<string>;
}