export enum AuthTypeEnum {
	// 单点登录鉴权
	OAUTH_2 = 'OAUTH_2',
	// 拼接url jumpCodes包含的，且source=1
	SPLICE_URL_WITH_JUMP_CODE_SOURCE1_AUTH = 'SPLICE_URL_WITH_JUMP_CODE_SOURCE1_AUTH',
	// 拼接url jumpCodes包含的，且source!=1
	SPLICE_URL_WITH_JUMP_CODE_AUTH = 'SPLICE_URL_WITH_JUMP_CODE_AUTH',
	// 拼接url jumpCodes不包含的 and source=1
	SPLICE_URL_WITH_SOURCE1 = 'SPLICE_URL_WITH_SOURCE1',
	// 拼接url 鉴权
	SPLICE_URL_WITH_AUTH = 'SPLICE_URL_WITH_AUTH',
	// 拼接url 不鉴权
	SPLICE_URL_WITHOUT_AUTH = 'SPLICE_URL_WITHOUT_AUTH',
	// 域内
	INTRA_DOMAIN = 'INTRA_DOMAIN',
	// 自定义类型，用于扩展后续SPI定制化应用跳转
	CUSTOM = 'CUSTOM',
	// 
	WITHOUT_AUTH = 'WITHOUT_AUTH'
}