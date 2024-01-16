/*
 * @Author: yut
 * @Date: 2023-08-10 09:47:05
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 16:41:07
 * @Descripttion:
 */
import { ref } from 'vue';
import {
  CC_MENU_IMenuItem,
  EPath,
  IProjectInfo,
  WI_EJumpType,
  WI_INavigationMenu,
  WI_MENU_ID,
} from './work-instruction.api';
import { postRequest } from '@/service/request';
import { getTenant } from '@/utils';
import message from '@/utils/message';
import { FSetStorageData } from '@/utils/storage';

class WorkInstructionService {
  private _projectInfo = ref<IProjectInfo>({
    timeRange: '', //托管周期
    energyRange: '', //能源类型
    hostingTypeName: '', //托管类型
    riskRatingName: '', //项目风险评级
    benchmarkType: '', //基准类型
    profit: '', //收益分享
    accessed: false,
  });

  public get projectInfo() {
    return this._projectInfo.value;
  }

  //最近访问
  private _recentlyAccessedMenuList = ref<
    { id: string; name: string; path: string; flag: WI_EJumpType; accessed: boolean }[]
  >([]);
  public get recentlyAccessedMenuList() {
    return this._recentlyAccessedMenuList.value;
  }

  public getProjectInfo = async () => {
    try {
      const res: HttpRequestModule.ResTemplate<IProjectInfo> = await postRequest(EPath.获取项目信息, {
        ...getTenant(),
      });
      if (res.code === 200 && res.success && res.data) {
        this._projectInfo.value = res.data;
      } else {
        this._projectInfo.value = {
          timeRange: '', //托管周期
          energyRange: '', //能源类型
          hostingTypeName: '', //托管类型
          riskRatingName: '', //项目风险评级
          benchmarkType: '', //基准类型
          profit: '', //收益分享
          accessed: false, //是否有权限
        };
        message.error(res.message || '获取项目信息失败');
      }
    } catch (error) {
      this._projectInfo.value = {
        timeRange: '', //托管周期
        energyRange: '', //能源类型
        hostingTypeName: '', //托管类型
        riskRatingName: '', //项目风险评级
        benchmarkType: '', //基准类型
        profit: '', //收益分享
        accessed: false, //是否有权限
      };
      message.error('获取项目信息失败');
    }
  };

  //导航
  private _navigationMenu = ref<WI_INavigationMenu | null>({
    prepareWork: [],
    energyCheck: [],
    energyControl: [],
    projectCheck: [],
  });
  public get navigationMenu() {
    return this._navigationMenu.value;
  }

  private _leftLoading = ref(true);
  public get leftLoading() {
    return this._leftLoading.value;
  }
  private _rightLoading = ref(true);
  public get rightLoading() {
    return this._rightLoading.value;
  }

  private convert = (data: CC_MENU_IMenuItem) => {
    return {
      name: data.name,
      id: data.id.toString(),
      path: data.url,
      flag: data.iframeFlag,
      accessed: data.accessed,
    };
  };

  private mapImaga = (id: string) => {
    let img = require('../../assets/images/work-instruction/wi-energy-budget.svg');
    switch (id) {
      case WI_MENU_ID.能耗预算表:
        img = require('../../assets/images/work-instruction/wi-energy-budget.svg');
        break;
      case WI_MENU_ID.户号管理:
        img = require('../../assets/images/work-instruction/wi-account-number-entry.svg');
        break;
      case WI_MENU_ID.节能量管理:
        img = require('../../assets/images/work-instruction/wi-energy-saving-submission.svg');
        break;
      case WI_MENU_ID.边界管理:
        img = require('../../assets/images/work-instruction/wi-border-submission.svg');
        break;
      case WI_MENU_ID.能耗预核算偏差:
        img = require('../../assets/images/work-instruction/wi-consumption-pre-account.svg');
        break;
      case WI_MENU_ID.能耗核算表:
        img = require('../../assets/images/work-instruction/wi-energy-consumption-account.svg');
        break;
      case WI_MENU_ID.项目预算表:
        img = require('../../assets/images/work-instruction/wi-project-budget.svg');
        break;
      case WI_MENU_ID.成本预核算偏差:
        img = require('../../assets/images/work-instruction/wi-project-pre-accounting.svg');
        break;
      case WI_MENU_ID.经营分析:
        img = require('../../assets/images/work-instruction/wi-business-analysis.svg');
        break;
      case WI_MENU_ID.项目核算表:
        img = require('../../assets/images/work-instruction/wi-project-accounting.svg');
        break;
      default:
        img = require('../../assets/images/work-instruction/wi-energy-budget.svg');
        break;
    }
    return img;
  };

  private convertNavigationMenu = (data: WI_INavigationMenu) => {
    return {
      prepareWork: data.prepareWork,
      energyCheck: data.energyCheck.map((item) => {
        return {
          ...item,
          showTag: item.id.toString() === WI_MENU_ID.节能量管理 || item.id.toString() === WI_MENU_ID.边界管理,
          img: this.mapImaga(item.id.toString()),
        };
      }),
      energyControl: data.energyControl,
      projectCheck: data.projectCheck.map((item) => {
        return {
          ...item,
          img: this.mapImaga(item.id.toString()),
        };
      }),
    };
  };

  public getNavigationMenu = async () => {
    try {
      this._leftLoading.value = true;
      const res: HttpRequestModule.ResTemplate<WI_INavigationMenu> = await postRequest(EPath.获取导航菜单);
      if (res.code === 200 && res.data && res.success) {
        this._navigationMenu.value = this.convertNavigationMenu(res.data);
        this._leftLoading.value = false;
      } else {
        this._navigationMenu.value = null;
        this._leftLoading.value = false;
      }
    } catch (error) {
      this._navigationMenu.value = null;
      this._leftLoading.value = false;
    }
  };

  public getQuickAccessMenu = async () => {
    try {
      this._rightLoading.value = true;
      const res: HttpRequestModule.ResTemplate<CC_MENU_IMenuItem[]> = await postRequest(EPath.用户最近访问菜单, {
        ...getTenant(),
      });
      if (res.code === 200 && res.success && res.data) {
        this._recentlyAccessedMenuList.value = res.data.map((item) => this.convert(item));
      } else {
        this._recentlyAccessedMenuList.value = [];
      }
    } catch (error) {
      this._recentlyAccessedMenuList.value = [];
    }
  };

  /**
   * 路由跳转
   * @param url
   */
  public onLinkTo = (url: string, flag: number, id: string, accessed: boolean, subTitle?: string) => {
    if (!accessed) {
      return;
    }
    if (subTitle === '完成能耗预算全期表') {
      FSetStorageData('toc-budgetFlag', 'true');
    }
    if (subTitle === '维护户号') {
      FSetStorageData('toc-household', 'true');
    }
    window.parent.postMessage(
      {
        url,
        flag,
        id,
        type: 'toc-router',
      },
      window.location.origin,
    );
  };

  constructor() {
    this.getNavigationMenu();
    Promise.all([this.getQuickAccessMenu(), this.getProjectInfo()]).then(() => {
      this._rightLoading.value = false;
    });
  }
}

export default new WorkInstructionService();
