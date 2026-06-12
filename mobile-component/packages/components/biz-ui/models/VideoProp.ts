import { MobileUploadTypeEnum } from './MobileUploadTypeEnum';
export default class VideoProp {
	// 标题
	label: Nullable<string>;
	// 文件大小上限（MB），默认为10，可选范围为1~20
	maxSize: Nullable<number>;
	// 移动端上传方式
	mobileUploadTypes: Nullable<MobileUploadTypeEnum[]>;
	// 是否必填，默认为true
	required: Nullable<boolean>;
}