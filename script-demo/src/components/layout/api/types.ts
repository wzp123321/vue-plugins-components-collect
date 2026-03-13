import { MenuItem, TreeNode } from '@/apis/types';
import { Component } from 'vue';
import type { RouteRecordName } from 'vue-router';

export interface LayoutAsideType {
  activeMenuCode?: string;
  activeParentMenuCode?: string;
  menuArray: Array<TreeNode<MenuItem>>;
  isSpread: boolean;
  defaultActive?: string | null | undefined | RouteRecordName;
}

export enum globalnavChooseMode {
  multiple = 'multiple', // 多选
  single = 'single', // 单选
}

export interface AlarmType {
  type: string;
  title: string;
  count: number | null;
  index?: number;
}

export interface AlarmConfigType {
  type: string;
  icon: Component;
  title?: string;
  count: number;
  list: AlarmType[];
}

export interface AlarmUrlsType {
  currentAlarmUrl: string;
  alarmUrl: string;
  accountInfoUrl: string;
}

// 告警数量
export interface AlarmCountType {
  warn: number;
  total: number;
  recover: number;
  critical: number;
  major: number;
  minor: number;
}

// 告警规则
export interface AlarmRuleType {
  isExistRule: boolean;
  alarmInterval: number;
}

// 按钮权限数据类型
export interface ButtonPermission {
  permissionId: string;
  name: string;
}
