import { JumpUrlTypeEnum } from './JumpUrlTypeEnum';
import { TerminalTypeEnum } from './TerminalTypeEnum';
import { UiActionTypeEnum } from './UiActionTypeEnum';
import { UrlOpenTypeEnum } from './UrlOpenTypeEnum';
export default class UiActionDefinition {
	// 界面动作编码，在产品模块内唯一
	code: Nullable<string>;
	// 界面动作名称
	name: Nullable<string>;
	// 界面动作类型
	type: Nullable<UiActionTypeEnum>;
	// 界面跳转url
	jumpUrl: Nullable<string>;
	// 界面跳转url类型
	jumpUrlType: Nullable<JumpUrlTypeEnum>;
	// 界面打开方式
	openType: Nullable<UrlOpenTypeEnum>;
	// 界面支持的终端类型清单
	supportTerminalTypes: Nullable<TerminalTypeEnum[]>;
	// appid，界面使用uni-app框架开发时必填
	uniAppId: Nullable<string>;
}