import { InjectionKey, readonly } from 'vue';
import { CC_EJumpType } from '../cloud-container.api';

export const CC_MENU_INJECTION = {
  EXPANDS: Symbol() as InjectionKey<string[]>,
  FRAME: Symbol() as InjectionKey<{
    tag: string;
    mapClassOfSelect: (menu: CC_MENU_IMenuItem) => 'selected' | 'active' | undefined;
    loadFrame: (menu: CC_MENU_IMenuItem) => void;
  }>,
};

export enum CC_MENU_EId {
  能耗分析3x = '31',
  能耗分析2x = '47',
  节能考核 = '53',
  能源事件2x = '22',
  能源事件3x = '46',
  能源助手2x = '32',
  能源助手3x = '48',
  告警管理2x = '20',
  告警管理3x = '45',
  经营分析 = '21',
  能耗预核算偏差 = '59',
  成本预核算偏差 = '56',
  能耗管控 = '57',
  能耗预算 = '58',
  文件管理 = '60',
  工单分析 = '40',
  项目信息 = '18',
}

export interface CC_MENU_IMenuItem {
  id: string;
  tag?: string;
  flag: CC_EJumpType;
  name: string;
  deep: number;
  order: number;
  path: string;
  children: Array<CC_MENU_IMenuItem>;
}
