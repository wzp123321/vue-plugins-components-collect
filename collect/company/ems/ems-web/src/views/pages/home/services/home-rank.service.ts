//#region
//#endregion

import { Subject } from 'rxjs';

/**
 * 能耗排名组件，树数据列表
 * @classdesc
 * @default HomeRankService *单例模式
 */

class HomeRankService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  //#region 获得组件的数据
  _TName = new Subject<any>();
  getTData = this._TName.asObservable();
  getTreeList(data: any) {
    // console.log(data);
    this._TName.next(data);
  }
  //#endregion
}

export default new HomeRankService();
