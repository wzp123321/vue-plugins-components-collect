export default class ApplicationBaseInfoDTO {
	// 应用实例id
	appInstanceId: Nullable<string>;
	// 应用实例名称
	name: Nullable<string>;
	// 应用实例的图标minio地址,含签名, 依赖fetchParts
	iconUrl: Nullable<string>;
}