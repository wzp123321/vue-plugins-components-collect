import ApplicationAppendVO from './ApplicationAppendVO';
import { ApplicationInstanceSourceEnum } from './ApplicationInstanceSourceEnum';
import { ApplicationInstanceTypeEnum } from './ApplicationInstanceTypeEnum';
// 应用实例详情
export default class GetApplicationDetailByIdVO {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 应用名称
  name: Nullable<string>;
  // 应用图标地址
  iconUrl: Nullable<string>;
  // 应用分类: platformOperation-平台运营、intelligentManagement-智慧管理、intelligentService-智慧服务
  type: Nullable<ApplicationInstanceTypeEnum>;
  // 创建方式: ownBusiness-自有业务、thirdBusiness-第三方业务
  source: Nullable<ApplicationInstanceSourceEnum>;
  // 产品模块id
  productId: Nullable<string>;
  // 产品模块名称
  productName: Nullable<string>;
  // 描述
  description: Nullable<string>;
  // 应用实例扩展信息
  applicationAppendVOList: Nullable<ApplicationAppendVO[]>;
}
