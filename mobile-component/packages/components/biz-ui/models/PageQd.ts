import FetchQd from './FetchQd';
import PageParam from './PageParam';
export default class PageQd extends FetchQd {
  // 分页信息
  page: PageParam = new PageParam();
}
