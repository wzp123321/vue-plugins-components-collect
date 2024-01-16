/*
 * @Author: yut
 * @Date: 2023-09-05 14:13:45
 * @LastEditors: yut
 * @LastEditTime: 2023-09-06 17:18:25
 * @Descripttion:
 */
import { ref } from 'vue';
import { CQA_IQuickAccessMenu, CQA_IUrlItem } from './cc-quick-access.api';
import { FResHandler, IRes } from '@/core/communication';
import axios from 'axios';
import { FGetAuthorization } from '@/utils';
import { FGetSession } from '@/core/token';
import { CC_MENU_IMenuItem } from '../cc-menu/cc-menu.api';
const enum EPath {
  快捷访问菜单 = '/menu/quickAccessMenu',
  用户最近访问菜单 = '/menu/queryUserRecentlyAccessedMenu',
  字典查询 = '/tenantDict/detail/queryByCode',
}
class CcQuickAccessService {
  //快捷访问
  private _quickAccessMenu = ref<CQA_IQuickAccessMenu | null>();
  public get quickAccessMenu() {
    return this._quickAccessMenu.value;
  }

  //最近访问
  private _recentlyAccessedMenuList = ref<CQA_IUrlItem[]>([]);
  public get recentlyAccessedMenuList() {
    return this._recentlyAccessedMenuList.value;
  }
  private _quickList = ref<{ name: string; dataList: CQA_IUrlItem[] }[]>([]);
  public get quickList() {
    return this._quickList.value;
  }

  /**
   * 获取快捷访问菜单
   */
  getQuickAccessMenu = async () => {
    try {
      const res: IRes<CQA_IQuickAccessMenu> = await axios.post(
        EPath.快捷访问菜单,
        { tenantId: FGetSession('tenant_id') ?? '', tenantCode: FGetSession('tenant_code') ?? '' },
        {
          headers: {
            Authorization: FGetAuthorization(),
          },
        },
      );
      const data = FResHandler(res);
      this._quickAccessMenu.value = data;
      this.getDicCode();
    } catch (error) {
      this._quickAccessMenu.value = null;
      console.warn('存储用户最近访问菜单', '-->', error);
    }
  };

  /**
   * 获取用户最近访问菜单
   */
  getUserRecentlyAccessedMenu = async () => {
    try {
      const res: IRes<CQA_IUrlItem[]> = await axios.post(
        EPath.用户最近访问菜单,
        { tenantId: FGetSession('tenant_id') ?? '', tenantCode: FGetSession('tenant_code') ?? '' },
        {
          headers: {
            Authorization: FGetAuthorization(),
          },
        },
      );
      const data = FResHandler(res);
      this._recentlyAccessedMenuList.value = data;
    } catch (error) {
      this._recentlyAccessedMenuList.value = [];
      console.warn('用户最近访问菜单', '-->', error);
    }
  };

  /**
   * 获取字典
   */
  getDicCode = async () => {
    try {
      const res: IRes<{ code: string; name: string }[]> = await axios.post(EPath.字典查询, 'menu_group', {
        headers: {
          Authorization: FGetAuthorization(),
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      const data = FResHandler(res);
      this.convert(data);
    } catch (error) {
      console.warn('字典查询', '-->', error);
    }
  };

  private convert = (value: { code: string; name: string }[]) => {
    this._quickList.value = [];
    value.forEach((item) => {
      this._quickList.value.push({
        name: item.name,
        dataList: this._quickAccessMenu.value?.menuMap[Number(item.code)] ?? [],
      });
    });
  };

  constructor() {
    this.getQuickAccessMenu();
    this.getUserRecentlyAccessedMenu();
  }
}

export default new CcQuickAccessService();
