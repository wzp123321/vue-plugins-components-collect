import GetDeveloperVO from './GetDeveloperVO';
export default class QueryDeveloperPageVO extends GetDeveloperVO {
  // 乐观锁版本号
  fVersion: Nullable<number>;
}
