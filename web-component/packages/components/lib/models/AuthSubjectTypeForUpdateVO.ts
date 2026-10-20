import { AuthorizedSubjectTypeEnum } from './AuthorizedSubjectTypeEnum';
export default class AuthSubjectTypeForUpdateVO {
  // 类型编码
  type: Nullable<AuthorizedSubjectTypeEnum>;
  // 对象ID
  subjectIds: string[] = [];
}
