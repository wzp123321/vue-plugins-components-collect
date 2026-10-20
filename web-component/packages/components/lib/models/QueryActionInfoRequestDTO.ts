import FetchQd from './FetchQd';
export default class QueryActionInfoRequestDTO extends FetchQd {
  // 任务实例id等于
  taskInstanceIdEq: Nullable<string>;
  // 流程实例id等于
  processInstanceIdEq: Nullable<string>;
}
