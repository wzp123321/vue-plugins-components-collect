import { FuzzyStrategy } from './FuzzyStrategy';
export default class FuzzyQd {
  // 模糊查询字段
  fields: Nullable<string[]>;
  // 模糊查询策略
  strategy: Nullable<FuzzyStrategy>;
  // 模糊查询值
  value: Nullable<string>;
}
