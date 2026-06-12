import IdName from './IdName';
import { ApplicationInstanceSourceEnum } from './ApplicationInstanceSourceEnum';
import { ApplicationInstanceTypeEnum } from './ApplicationInstanceTypeEnum';
export default class ApplicationForPageVO extends IdName {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 应用图标地址
  iconUrl: Nullable<string>;
  // 应用分类: platformOperation-平台运营、intelligentManagement-智慧管理、intelligentService-智慧服务
  type: Nullable<ApplicationInstanceTypeEnum>;
  // 创建方式: ownBusiness-自有业务、thirdBusiness-第三方业务
  source: Nullable<ApplicationInstanceSourceEnum>;
  // 描述
  description: Nullable<string>;
  // 状态: false-下线 true-上线
  status: Nullable<boolean>;
  // 创建时间
  createTime: Nullable<Date>;
  // 产品模块id
  productId: Nullable<string>;
  // 产品模块名称
  productName: Nullable<string>;
  // 是否支持自定义配置: 0-否,1-是
  configurable: Nullable<boolean>;
  // 自定义配置跳转链接
  customConfigUrl: Nullable<string>;
  // 默认应用入口地址
  applicationHomeUrl: Nullable<string>;
}
