import PageQd from './PageQd';
import { ApplicationInstanceSourceEnum } from './ApplicationInstanceSourceEnum';
import { ApplicationInstanceTypeEnum } from './ApplicationInstanceTypeEnum';
export default class QueryApplicationForPageRequest extends PageQd {
  // 应用名称,应用实例id模糊查询
  keywordLike: Nullable<string>;
  // 应用分类: platformOperation-平台运营、intelligentManagement-智慧管理、intelligentService-智慧服务
  typeEq: Nullable<ApplicationInstanceTypeEnum>;
  // 创建方式: ownBusiness-自有业务、thirdBusiness-第三方业务
  sourceEq: Nullable<ApplicationInstanceSourceEnum>;
}
