import { OrderDirection } from './OrderDirection';
export default class OrderParam {
  // 排序字段
  field: Nullable<string>;
  // 排序方向
  direction: Nullable<OrderDirection>;
}
