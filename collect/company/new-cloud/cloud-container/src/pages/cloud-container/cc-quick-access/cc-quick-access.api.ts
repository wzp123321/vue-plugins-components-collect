/*
 * @Author: yut
 * @Date: 2023-09-05 14:15:49
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 11:20:22
 * @Descripttion:
 */

export interface CQA_IQuickAccessMenu {
  menuMap: {
    [key: string]: CQA_IUrlItem[];
  };
}

export enum CQA_ERole {
  财务 = '财务',
  能源经理 = '能源经理',
  管理层 = '管理层',
}

export interface CQA_IUrlItem {
  id: number;
  name: string;
  url: string;
  accessed: boolean | null;
  iframeFlag: number;
}
