import AuthorizedSubjectVO from './AuthorizedSubjectVO';
import { AuthorizedSubjectTypeEnum } from './AuthorizedSubjectTypeEnum';
export default class AuthorizedSubjectTypeVO {
  // 类型编码
  type: Nullable<AuthorizedSubjectTypeEnum>;
  // 类型名称
  typeName: Nullable<string>;
  // 多个授权对象
  subject: Nullable<AuthorizedSubjectVO[]>;
}
