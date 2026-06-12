export default class FileProp {
	// 标题
	label: Nullable<string>;
	// 最多上传数量，默认值为9，支持的配置范围为1~10
	maxNumber: Nullable<number>;
	// 是否必填，默认为true
	required: Nullable<boolean>;
}