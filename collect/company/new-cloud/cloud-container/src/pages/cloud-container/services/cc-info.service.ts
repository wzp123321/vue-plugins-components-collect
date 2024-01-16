import { IRes, FResHandler } from '@/core/communication';
import { FGetCookie } from '@/core/token';
import axios from 'axios';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { FGetAuthorization } from '@/utils';

// 后台接口地址
const enum EPath {
  查询项目名称 = '/projectManagement/queryProjectName',
}

/**
 * 信息服务
 * @classdesc 实现项目信息与用户数据获取等功能
 * @default InfoService *单例模式
 */
class InfoService {
  private readonly _bsProject$ = new BehaviorSubject<string | undefined>(undefined);
  private readonly _bsUser$ = new BehaviorSubject<string | undefined>(FGetCookie('realName'));

  // 项目名称 *Observable
  public get refProject$(): Observable<string> {
    return this._bsProject$.pipe(
      filter((v) => !!v),
      map((v) => v!),
    );
  }

  // 用户名 *Observable
  public get refUser$(): Observable<string> {
    return this._bsUser$.pipe(
      filter((v) => !!v),
      map((v) => v!),
    );
  }

  constructor() {
    this.query();
  }

  private async query(): Promise<void> {
    try {
      const res: IRes<IResInfo> = await axios.post(
        EPath.查询项目名称,
        {},
        {
          headers: {
            Authorization: FGetAuthorization(),
          },
        },
      );
      const data = FResHandler(res);
      this._bsProject$.next(data?.projectName);
    } catch (error) {
      console.warn('查询项目名称', '-->', error);
    }
  }
}
export default new InfoService();

interface IResInfo {
  projectName: string;
}
