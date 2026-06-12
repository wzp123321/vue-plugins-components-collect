import BusinessStatusDTO from './BusinessStatusDTO';
import UiActionDefinition from './UiActionDefinition';
export default class BusinessCategoryDTO {
	// 产品模块id
	productId: Nullable<string>;
	// 业务分类编码，在产品模块内唯一
	code: Nullable<string>;
	// 业务分类名称
	name: Nullable<string>;
	// 基于业务分类注册的界面动作
	uiActions: Nullable<UiActionDefinition[]>;
	// 基于业务分类注册的业务状态，用于进行业务状态绑定
	businessStatuses: Nullable<BusinessStatusDTO[]>;
	// 业务方接收工作流通知的api接口请求路径，支持http(无注册中心的)/lb(注册中心内的)协议的绝对地址，要求以POST形式实现，1s超时
	notifyApi: Nullable<string>;
}