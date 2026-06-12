import { ApplicationInstanceTypeEnum } from './ApplicationInstanceTypeEnum';
export default class UpdateApplicationRequest {
  // id,主键
  id: string = '';
  // 应用名称
  name: string = '';
  // 应用图标地址
  iconUrl: string = '';
  // 应用分类: platformOperation-平台运营、intelligentManagement-智慧管理、intelligentService-智慧服务
  type: Nullable<ApplicationInstanceTypeEnum>;
  // 描述
  description: Nullable<string>;
}
