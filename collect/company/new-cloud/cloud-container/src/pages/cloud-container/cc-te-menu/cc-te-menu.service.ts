/*
 * @Author: yut
 * @Date: 2023-09-13 15:25:01
 * @LastEditors: yut
 * @LastEditTime: 2023-10-26 12:30:27
 * @Descripttion:
 */
import { FResHandler, IRes } from '@/core/communication';
import { FGetAuthorization } from '@/utils';
import axios from 'axios';
import { CC_MENU_EId, CC_MENU_IMenuItem } from './cc-te-menu.api';
import { CC_EJumpType } from '../cloud-container.api';
import { BehaviorSubject, Observable } from 'rxjs';

const enum EPath {
  菜单 = '/menu/queryHostingMenu',
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
class CcTeMenuService {
  private readonly _bsMenu$ = new BehaviorSubject<Array<CC_MENU_IMenuItem>>([]);

  // 菜单树 *Observable
  public get refMenu$(): Observable<CC_MENU_IMenuItem[]> {
    return this._bsMenu$;
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
      return menu.children?.some((child) => this.checkByTag(child, tag)) ?? false;
    }
  }

  /**
   * 获取菜单
   */
  private async query(): Promise<void> {
    const convert = (data: IResMenuItem, deep: number = 0, str: string = ''): CC_MENU_IMenuItem => {
      let name = '';
      if (data.childMenu?.length) {
        name = data.name;
      }
      return {
        id: data.id?.toString(),
        tag: data.url?.match(/[^\/]+(?!.*\/)/)?.[0],
        flag: data.iframeFlag,
        name: data.id?.toString(),
        parentName: data.childMenu.length ? null : str,
        deep,
        order: data.orderNum,
        meta: {
          title: data.name,
          floatEnable: data.id.toString() === CC_MENU_EId.快捷访问,
        },
        path: data.url,
        children:
          data.childMenu.length === 0
            ? null
            : data.childMenu?.map((child) => convert(child, deep + 1, name)).sort((a, b) => a.order - b.order) ?? null,
      };
    };
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

  constructor() {
    this.query();
  }
}

export default new CcTeMenuService();
