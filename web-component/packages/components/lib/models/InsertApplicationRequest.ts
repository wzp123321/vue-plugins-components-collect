import { ApplicationInstanceSourceEnum } from './ApplicationInstanceSourceEnum';
import { ApplicationInstanceTypeEnum } from './ApplicationInstanceTypeEnum';
export default class InsertApplicationRequest {
  // 应用名称
  name: string = '';
  // 应用图标地址
  iconUrl: string = '';
  // 应用分类: platformOperation-平台运营、intelligentManagement-智慧管理、intelligentService-智慧服务
  type: Nullable<ApplicationInstanceTypeEnum>;
  // 创建方式: ownBusiness-自有业务、thirdBusiness-第三方业务
  source: Nullable<ApplicationInstanceSourceEnum>;
  // 产品模块id
  productId: Nullable<string>;
  // 描述
  description: Nullable<string>;
  // 默认应用入口地址
  applicationHomeUrl: Nullable<string>;
}
