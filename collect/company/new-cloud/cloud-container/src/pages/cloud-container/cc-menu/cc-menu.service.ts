import { FResHandler, IRes } from '@/core/communication';
import { BehaviorSubject, Observable } from 'rxjs';
import { CC_MENU_IMenuItem } from './cc-menu.api';
import { TDeepReadonly } from '@/core/types';
import axios from 'axios';
import { CC_EJumpType } from '../cloud-container.api';
import { FGetAuthorization } from '@/utils';

// 后台接口地址
const enum EPath {
  菜单 = '/menu/queryHostingMenu',
}

/**
 * 菜单组件服务
 * @classdesc 维护菜单组件数据
 * @exports MenuService *普通类
 */
export class MenuService {
  private readonly _bsMenu$ = new BehaviorSubject<Array<CC_MENU_IMenuItem>>([]);

  // 菜单树 *Observable
  public get refMenu$(): Observable<TDeepReadonly<Array<CC_MENU_IMenuItem>>> {
    return this._bsMenu$;
  }

  constructor() {
    this.query();
  }

  /**
   * 检测菜单条目是否匹配标记
   * @param menu 菜单条目
   * @param tag 菜单标记
   * @returns 目标标记是否存在于该条目及其子条目中
   */
  public checkByTag(menu: CC_MENU_IMenuItem, tag: string): boolean {
    if (menu.tag && menu.tag === tag) {
      return true;
    } else {
      return menu.children.some((child) => this.checkByTag(child, tag));
    }
  }

  /**
   * 获取菜单
   */
  private async query(): Promise<void> {
    const convert = (data: IResMenuItem, deep: number = 0): CC_MENU_IMenuItem => ({
      id: data.id?.toString(),
      tag: data.url?.match(/[^\/]+(?!.*\/)/)?.[0],
      flag: data.iframeFlag,
      name: data.name,
      deep,
      order: data.orderNum,
      path: data.url,
      children: data.childMenu?.map((child) => convert(child, deep + 1)).sort((a, b) => a.order - b.order) ?? [],
    });
    try {
      const res: IRes<Array<IResMenuItem>> = await axios.post(
        EPath.菜单,
        {},
        {
          headers: {
            Authorization: FGetAuthorization(),
          },
        },
      );
      const data = FResHandler(res);
      this._bsMenu$.next(data?.map((item) => convert(item)).sort((a, b) => a.order - b.order) ?? []);
    } catch (error) {
      console.warn('菜单', '-->', error);
    }
  }
}

interface IResMenuItem {
  childMenu: Array<IResMenuItem>; // 子节点
  id: number;
  iframeFlag: CC_EJumpType; // 跳转标记 0-跳转本地 1-跳转端侧
  name: string; // 菜单名称
  orderNum: number; // 菜单排序
  remark: string; // 备注
  type: number; // 菜单类型 1-菜单 2-功能
  url: string; // 链接
}
