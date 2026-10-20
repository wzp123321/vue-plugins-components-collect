import AddressVariableMapping from './AddressVariableMapping';
import { PageTypeEnum } from './PageTypeEnum';
export default class CustomPageAddress {
	// 界面类型
	pageType: Nullable<PageTypeEnum>;
	// 业务界面id，当pageType为CUSTOM时必填
	customPageId: Nullable<string>;
	// 地址变量实际值映射对象列表
	addressVariableMappings: Nullable<AddressVariableMapping[]>;
}