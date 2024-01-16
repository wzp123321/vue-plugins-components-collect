import { CC_EJumpType } from '../cloud-container.api';

/*
 * @Author: yut
 * @Date: 2023-09-05 15:42:51
 * @LastEditors: yut
 * @LastEditTime: 2023-10-26 12:24:52
 * @Descripttion:
 */
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
  经营分析 = '103',
  能耗预核算偏差 = '59',
  成本预核算偏差 = '56',
  能耗管控 = '105',
  能耗预核算分析 = '58',
  文件管理 = '60',
  工单分析 = '40',
  项目信息 = '19',
  能耗核算表 = '102',
  快捷访问 = '101',
  工作指引 = '100',
  项目预算表 = '63',
  项目预核算分析 = '104',
}

export interface CC_MENU_IMenuItem {
  id: string;
  tag?: string;
  flag: CC_EJumpType;
  name: string;
  parentName?: string | null;
  deep: number;
  order: number;
  path: string;
  meta: {
    icon?: string;
    title: string;
    floatEnable?: boolean;
  };
  children: Array<CC_MENU_IMenuItem> | null;
}
